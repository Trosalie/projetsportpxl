<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\Logs;
use Illuminate\Support\Facades\Auth;

class LogService
{
    public function logAction(Request $request, string $action, ?string $tableName = null, array $details = []): void
    {
        $userId = Auth::id() ?? optional($request->user())->id;

        if (!$userId) {
            return;
        }

        Logs::create([
            'action' => $action,
            'user_id' => $userId,
            'table_name' => $tableName,
            'ip_address' => $request->ip(),
            'details' => $details ? json_encode($details) : null,
        ]);
    }
}