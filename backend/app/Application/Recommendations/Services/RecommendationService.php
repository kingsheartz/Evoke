<?php

namespace App\Application\Recommendations\Services;

use App\Models\Academy\Course;
use App\Models\Shop\Product;
use App\Models\Tours\Package;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
  private const POPULARITY_WINDOW_DAYS = 90;

  public function relatedPackages(Package $package, int $limit = 3): EloquentCollection
  {
    $pinned = $this->pinnedPackages($package->related_slugs ?? [], $package->slug, $limit);
    if ($pinned->count() >= $limit) {
      return $pinned->take($limit);
    }

    $excludeIds = $pinned->pluck('id')->push($package->id)->all();
    $scored = $this->scorePackages(
      Package::query()
            ->where('is_active', true)
            ->where('id', '!=', $package->id)
            ->when($excludeIds !== [], fn (Builder $q) => $q->whereNotIn('id', $excludeIds))
            ->with('itineraryDays')
            ->withCount([
              'bookings as popularity_count' => fn (Builder $q) => $this->applyPopularityWindow($q),
            ])
            ->get(),
      $package,
    );

    return $pinned->concat($scored->take($limit - $pinned->count()))->values();
  }

  public function relatedProducts(Product $product, int $limit = 3): EloquentCollection
  {
    $pinned = $this->pinnedProducts($product->related_slugs ?? [], $product->slug, $limit);
    if ($pinned->count() >= $limit) {
      return $pinned->take($limit);
    }

    $excludeIds = $pinned->pluck('id')->push($product->id)->all();
    $scored = $this->scoreProducts(
      Product::query()
            ->where('is_active', true)
            ->where('id', '!=', $product->id)
            ->when($excludeIds !== [], fn (Builder $q) => $q->whereNotIn('id', $excludeIds))
            ->with('category')
            ->withCount([
              'orderItems as popularity_count' => fn (Builder $q) => $this->applyOrderItemPopularityWindow($q),
            ])
            ->get(),
      $product,
    );

    return $pinned->concat($scored->take($limit - $pinned->count()))->values();
  }

  public function relatedCourses(Course $course, int $limit = 3): EloquentCollection
  {
    $pinned = $this->pinnedCourses($course->related_slugs ?? [], $course->slug, $limit);
    if ($pinned->count() >= $limit) {
      return $pinned->take($limit);
    }

    $excludeIds = $pinned->pluck('id')->push($course->id)->all();
    $popularity = $this->coursePopularityCounts($excludeIds);
    $scored = $this->scoreCourses(
      Course::query()
            ->where('status', 'published')
            ->where('id', '!=', $course->id)
            ->when($excludeIds !== [], fn (Builder $q) => $q->whereNotIn('id', $excludeIds))
            ->with(['category', 'batches.trainer'])
            ->get()
            ->each(fn (Course $item) => $item->setAttribute('popularity_count', $popularity[$item->id] ?? 0)),
      $course,
    );

    return $pinned->concat($scored->take($limit - $pinned->count()))->values();
  }

  public function trendingPackages(int $limit = 6): EloquentCollection
  {
    return Package::query()
      ->where('is_active', true)
      ->with('itineraryDays')
      ->withCount([
        'bookings as popularity_count' => fn (Builder $q) => $this->applyPopularityWindow($q),
      ])
      ->orderByDesc('is_featured')
      ->orderByDesc('popularity_count')
      ->orderByDesc('updated_at')
      ->limit($limit)
      ->get();
  }

  public function trendingProducts(int $limit = 6): EloquentCollection
  {
    return Product::query()
      ->where('is_active', true)
      ->with('category')
      ->withCount([
        'orderItems as popularity_count' => fn (Builder $q) => $this->applyOrderItemPopularityWindow($q),
      ])
      ->orderByDesc('is_featured')
      ->orderByDesc('popularity_count')
      ->orderByDesc('updated_at')
      ->limit($limit)
      ->get();
  }

  public function trendingCourses(int $limit = 6): EloquentCollection
  {
    $popularity = $this->coursePopularityCounts();
    $ids = Course::query()
      ->where('status', 'published')
      ->get(['id', 'is_featured', 'updated_at'])
      ->map(function (Course $course) use ($popularity) {
        $course->setAttribute('popularity_count', $popularity[$course->id] ?? 0);

        return $course;
      })
      ->sortByDesc(fn (Course $course) => ($course->is_featured ? 1000 : 0) + $course->popularity_count)
      ->take($limit)
      ->pluck('id');

    if ($ids->isEmpty()) {
      return new EloquentCollection();
    }

    return Course::query()
      ->whereIn('id', $ids)
      ->with(['category', 'batches.trainer'])
      ->get()
      ->sortBy(fn (Course $course) => $ids->search($course->id))
      ->values();
  }

  /** @param array<int, string>|null $slugs */
  private function pinnedPackages(?array $slugs, string $excludeSlug, int $limit): EloquentCollection
  {
    $slugs = $this->normalizeSlugs($slugs, $excludeSlug);
    if ($slugs === []) {
      return new EloquentCollection();
    }

    $items = Package::query()
      ->where('is_active', true)
      ->whereIn('slug', $slugs)
      ->with('itineraryDays')
      ->get();

    return $this->orderBySlugList($items, $slugs)->take($limit)->values();
  }

  /** @param array<int, string>|null $slugs */
  private function pinnedProducts(?array $slugs, string $excludeSlug, int $limit): EloquentCollection
  {
    $slugs = $this->normalizeSlugs($slugs, $excludeSlug);
    if ($slugs === []) {
      return new EloquentCollection();
    }

    $items = Product::query()
      ->where('is_active', true)
      ->whereIn('slug', $slugs)
      ->with('category')
      ->get();

    return $this->orderBySlugList($items, $slugs)->take($limit)->values();
  }

  /** @param array<int, string>|null $slugs */
  private function pinnedCourses(?array $slugs, string $excludeSlug, int $limit): EloquentCollection
  {
    $slugs = $this->normalizeSlugs($slugs, $excludeSlug);
    if ($slugs === []) {
      return new EloquentCollection();
    }

    $items = Course::query()
      ->where('status', 'published')
      ->whereIn('slug', $slugs)
      ->with(['category', 'batches.trainer'])
      ->get();

    return $this->orderBySlugList($items, $slugs)->take($limit)->values();
  }

  /** @param array<int, string>|null $slugs */
  private function normalizeSlugs(?array $slugs, string $excludeSlug): array
  {
    return collect($slugs ?? [])
      ->map(fn ($slug) => trim((string) $slug))
      ->filter(fn (string $slug) => $slug !== '' && $slug !== $excludeSlug)
      ->unique()
      ->values()
      ->all();
  }

  /** @param EloquentCollection<int, Package|Product|Course> $items */
  private function orderBySlugList(EloquentCollection $items, array $slugs): Collection
  {
    return collect($slugs)
      ->map(fn (string $slug) => $items->firstWhere('slug', $slug))
      ->filter();
  }

  private function applyPopularityWindow(Builder $query): void
  {
    $query->where('created_at', '>=', now()->subDays(self::POPULARITY_WINDOW_DAYS))
      ->whereNotIn('status', ['cancelled']);
  }

  private function applyOrderItemPopularityWindow(Builder $query): void
  {
    $query->where('created_at', '>=', now()->subDays(self::POPULARITY_WINDOW_DAYS))
      ->whereHas('order', fn (Builder $order) => $order->whereNotIn('status', ['cancelled']));
  }

  /** @return array<int, int> */
  private function coursePopularityCounts(array $excludeIds = []): array
  {
    return DB::table('academy_enrollments')
      ->join('academy_batches', 'academy_batches.id', '=', 'academy_enrollments.batch_id')
      ->join('academy_courses', 'academy_courses.id', '=', 'academy_batches.course_id')
      ->when($excludeIds !== [], fn ($q) => $q->whereNotIn('academy_courses.id', $excludeIds))
      ->where('academy_enrollments.created_at', '>=', now()->subDays(self::POPULARITY_WINDOW_DAYS))
      ->whereNotIn('academy_enrollments.status', ['cancelled', 'rejected'])
      ->groupBy('academy_courses.id')
      ->selectRaw('academy_courses.id as course_id, count(*) as total')
      ->pluck('total', 'course_id')
      ->map(fn ($count) => (int) $count)
      ->all();
  }

  /** @param EloquentCollection<int, Package> $candidates */
  private function scorePackages(EloquentCollection $candidates, Package $source): Collection
  {
    return $candidates
      ->sortByDesc(fn (Package $candidate) => $this->packageScore($candidate, $source))
      ->values();
  }

  private function packageScore(Package $candidate, Package $source): int
  {
    $score = 0;
    if ($candidate->is_featured) {
      $score += 100;
    }
    if ($candidate->type === $source->type) {
      $score += 40;
    }
    if (strcasecmp($candidate->destination, $source->destination) === 0) {
      $score += 30;
    }
    if ($this->withinPriceBand((float) $candidate->price, (float) $source->price)) {
      $score += 20;
    }
    $score += min((int) ($candidate->popularity_count ?? 0) * 3, 30);
    $daysSinceUpdate = (int) min($candidate->updated_at?->diffInDays(now()) ?? 99, 14);
    $score += max(0, 14 - $daysSinceUpdate);

    return $score;
  }

  /** @param EloquentCollection<int, Product> $candidates */
  private function scoreProducts(EloquentCollection $candidates, Product $source): Collection
  {
    return $candidates
      ->sortByDesc(fn (Product $candidate) => $this->productScore($candidate, $source))
      ->values();
  }

  private function productScore(Product $candidate, Product $source): int
  {
    $score = 0;
    if ($candidate->is_featured) {
      $score += 100;
    }
    if ($candidate->category_id === $source->category_id) {
      $score += 40;
    }
    if ($this->withinPriceBand((float) $candidate->price, (float) $source->price)) {
      $score += 20;
    }
    $score += min((int) ($candidate->popularity_count ?? 0) * 3, 30);
    $daysSinceUpdate = (int) min($candidate->updated_at?->diffInDays(now()) ?? 99, 14);
    $score += max(0, 14 - $daysSinceUpdate);

    return $score;
  }

  /** @param EloquentCollection<int, Course> $candidates */
  private function scoreCourses(EloquentCollection $candidates, Course $source): Collection
  {
    return $candidates
      ->sortByDesc(fn (Course $candidate) => $this->courseScore($candidate, $source))
      ->values();
  }

  private function courseScore(Course $candidate, Course $source): int
  {
    $score = 0;
    if ($candidate->is_featured) {
      $score += 100;
    }
    if ($candidate->category_id === $source->category_id) {
      $score += 40;
    }
    if ($this->withinPriceBand((float) $candidate->fees, (float) $source->fees)) {
      $score += 20;
    }
    $score += min((int) ($candidate->popularity_count ?? 0) * 3, 30);
    $daysSinceUpdate = (int) min($candidate->updated_at?->diffInDays(now()) ?? 99, 14);
    $score += max(0, 14 - $daysSinceUpdate);

    return $score;
  }

  private function withinPriceBand(float $candidatePrice, float $sourcePrice): bool
  {
    if ($sourcePrice <= 0) {
      return false;
    }

    $delta = abs($candidatePrice - $sourcePrice) / $sourcePrice;

    return $delta <= 0.25;
  }
}
