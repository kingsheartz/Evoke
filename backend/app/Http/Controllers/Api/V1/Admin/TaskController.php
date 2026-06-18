<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
        ]);

        $tasks = AdminTask::with('user:id,name')
            ->when(
                $validated['date'] ?? null,
                fn ($q, $date) => $q->whereDate('due_at', $date),
            )
            ->when(
                ($validated['from'] ?? null) && ($validated['to'] ?? null),
                fn ($q) => $q->whereBetween('due_at', [
                    $validated['from'].' 00:00:00',
                    $validated['to'].' 23:59:59',
                ]),
            )
            ->when(
                $validated['status'] ?? null,
                fn ($q, $status) => $q->where('status', $status),
            )
            ->orderByRaw('due_at IS NULL')
            ->orderBy('due_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'due_at' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        $user = $request->user();

        $task = AdminTask::create([
            ...$validated,
            'user_id' => $user->id,
            'branch_id' => $user->branch_id,
            'status' => $validated['status'] ?? 'pending',
            'priority' => $validated['priority'] ?? 'medium',
        ]);

        return response()->json(['data' => $task->load('user:id,name')], 201);
    }

    public function update(Request $request, AdminTask $task): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:5000',
            'due_at' => 'nullable|date',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        $task->update($validated);

        return response()->json(['data' => $task->fresh('user:id,name')]);
    }

    public function destroy(AdminTask $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}
