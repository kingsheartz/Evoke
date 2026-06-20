<?php

namespace App\Http\Controllers\Api\V1\Recommendations;

use App\Application\Recommendations\Services\RecommendationService;
use App\Http\Controllers\Controller;
use App\Models\Academy\Course;
use App\Models\Shop\Product;
use App\Models\Tours\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferingRecommendationController extends Controller
{
  public function __construct(
    private readonly RecommendationService $recommendations,
  ) {}

  public function relatedTourPackage(Request $request, string $slug): JsonResponse
  {
    $package = Package::where('slug', $slug)->where('is_active', true)->firstOrFail();
    $limit = min($request->integer('limit', 3), 12);
    $items = $this->recommendations->relatedPackages($package, $limit);

    return response()->json(['data' => $items]);
  }

  public function relatedShopProduct(Request $request, string $slug): JsonResponse
  {
    $product = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();
    $limit = min($request->integer('limit', 3), 12);
    $items = $this->recommendations->relatedProducts($product, $limit);

    return response()->json(['data' => $items]);
  }

  public function relatedAcademyCourse(Request $request, string $slug): JsonResponse
  {
    $course = Course::where('slug', $slug)->where('status', 'published')->firstOrFail();
    $limit = min($request->integer('limit', 3), 12);
    $items = $this->recommendations->relatedCourses($course, $limit);

    return response()->json(['data' => $items]);
  }

  public function trendingTours(Request $request): JsonResponse
  {
    $limit = min($request->integer('limit', 6), 24);

    return response()->json(['data' => $this->recommendations->trendingPackages($limit)]);
  }

  public function trendingShop(Request $request): JsonResponse
  {
    $limit = min($request->integer('limit', 6), 24);

    return response()->json(['data' => $this->recommendations->trendingProducts($limit)]);
  }

  public function trendingAcademy(Request $request): JsonResponse
  {
    $limit = min($request->integer('limit', 6), 24);

    return response()->json(['data' => $this->recommendations->trendingCourses($limit)]);
  }
}
