<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Services\LogService;


class LogsController extends Controller
{
    // send logs from database
    public function getLogs(Request $request)
    {
        try {
            $logs = DB::table('logs')
                ->join('log_actions', 'logs.action_id', '=', 'log_actions.id')
                ->join('photographers', 'logs.user_id', '=', 'photographers.id')
                ->select('logs.*', 'log_actions.action', 'photographers.name as photographer_name')
                ->orderBy('logs.created_at', 'desc')
                ->get();

            return response()->json($logs);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
