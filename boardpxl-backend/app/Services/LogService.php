<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\Logs;
use App\Models\LogActions;
use Illuminate\Support\Facades\Auth;

class LogService
{
    private static $actionCache = [];

    public function logAction(Request $request, string $action, ?string $tableName = null, array $details = []): void
    {
        $userId = Auth::id() ?? optional($request->user())->id;

        if (!$userId) {
            return;
        }

        // Get action_id from cache or database
        $actionId = $this->getActionId($action);
        
        if (!$actionId) {
            return; // Skip if action not found
        }

        Logs::create([
            'action_id' => $actionId,
            'user_id' => $userId,
            'table_name' => $tableName ? strtoupper($tableName) : null,
            'ip_address' => $request->ip(),
            'details' => $details ? json_encode($details) : null,
        ]);
    }

    private function getActionId(string $action): ?int
    {
        if (!isset(self::$actionCache[$action])) {
            $logAction = LogActions::where('action', $action)->first();
            self::$actionCache[$action] = $logAction ? $logAction->id : null;
        }
        
        return self::$actionCache[$action];
    }
}