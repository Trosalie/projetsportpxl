<?php

namespace App\Http\Controllers;

use App\Models\SettlementReport;
use App\Models\InvoicePayment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\LogService;
use Illuminate\Support\Facades\DB;

/**
 * @class SettlementReportController
 * @brief Controller managing settlement reports
 * 
 * Manages operations related to settlement reports including
 * retrieving the last report and calculating turnover from invoices.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-28
 */
class SettlementReportController extends Controller
{
    private LogService $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    /**
     * Get the last settlement report for a photographer
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getLastSettlementReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'photographer_id' => 'required|integer',
            ]);

            $lastReport = SettlementReport::where('photographer_id', $validated['photographer_id'])
                ->orderBy('period_end_date', 'desc')
                ->first();

            if (!$lastReport) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'No previous settlement report found'
                ]);
            }

            $this->logService->logAction($request, 'get_last_settlement_report', 'SETTLEMENT_REPORTS', [
                'photographer_id' => $validated['photographer_id'],
                'report_id' => $lastReport->id,
            ]);

            return response()->json([
                'success' => true,
                'data' => $lastReport
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'get_last_settlement_report_failed', 'SETTLEMENT_REPORTS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate turnover from invoices since a given date
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function calculateTurnoverSinceDate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'photographer_id' => 'required|integer',
                'start_date' => 'required|date',
            ]);

            // Get all payment invoices (versements de CA) since the start date
            $turnover = InvoicePayment::where('photographer_id', $validated['photographer_id'])
                ->where('issue_date', '>=', $validated['start_date'])
                ->sum('raw_value');

            $this->logService->logAction($request, 'calculate_turnover_since_date', 'INVOICE_PAYMENTS', [
                'photographer_id' => $validated['photographer_id'],
                'start_date' => $validated['start_date'],
                'turnover' => $turnover,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'turnover' => $turnover,
                    'start_date' => $validated['start_date'],
                ]
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'calculate_turnover_since_date_failed', 'INVOICE_PAYMENTS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new settlement report
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function createSettlementReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'photographer_id' => 'required|integer',
                'amount' => 'required|numeric|min:0',
                'commission' => 'required|numeric|min:0',
                'period_start_date' => 'required|date',
                'period_end_date' => 'required|date',
                'status' => 'string|in:pending,validated,rejected',
            ]);

            $report = SettlementReport::create($validated);

            $this->logService->logAction($request, 'create_settlement_report', 'SETTLEMENT_REPORTS', [
                'photographer_id' => $validated['photographer_id'],
                'report_id' => $report->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Settlement report created successfully.',
                'data' => $report
            ], 201);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'create_settlement_report_failed', 'SETTLEMENT_REPORTS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
