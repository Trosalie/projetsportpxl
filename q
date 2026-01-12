[1mdiff --git a/boardpxl-backend/app/Console/Kernel.php b/boardpxl-backend/app/Console/Kernel.php[m
[1mindex 746b80d..5ba671c 100644[m
[1m--- a/boardpxl-backend/app/Console/Kernel.php[m
[1m+++ b/boardpxl-backend/app/Console/Kernel.php[m
[36m@@ -15,7 +15,8 @@[m [mclass Kernel extends ConsoleKernel[m
      */[m
     protected function schedule(Schedule $schedule)[m
     {[m
[31m-        // $schedule->command('inspire')->hourly();[m
[32m+[m[32m        $schedule->call(fn () => app(PennylaneService::class)->syncInvoices())[m
[32m+[m[32m            ->everyFiveMinutes();[m
     }[m
 [m
     /**[m
[1mdiff --git a/boardpxl-backend/app/Http/Controllers/Auth/LoginController.php b/boardpxl-backend/app/Http/Controllers/Auth/LoginController.php[m
[1mindex c89742e..e42ca10 100644[m
[1m--- a/boardpxl-backend/app/Http/Controllers/Auth/LoginController.php[m
[1m+++ b/boardpxl-backend/app/Http/Controllers/Auth/LoginController.php[m
[36m@@ -8,18 +8,10 @@[m
 use App\Http\Controllers\Controller;[m
 use Illuminate\Support\Facades\Auth;[m
 use Illuminate\Validation\ValidationException;[m
[31m-use App\Services\LogService;[m
 [m
 [m
 class LoginController extends Controller[m
 {[m
[31m-    private LogService $logService;[m
[31m-[m
[31m-    public function __construct(LogService $logService)[m
[31m-    {[m
[31m-        $this->logService = $logService;[m
[31m-    }[m
[31m-[m
     /*[m
     |--------------------------------------------------------------------------[m
     | Login Controller[m
[36m@@ -51,11 +43,6 @@[m [mpublic function login(Request $request)[m
         // Créer un token API pour l'authentification[m
         $token = $photographer->createToken('API Token')->plainTextToken;[m
 [m
[31m-        $this->logService->logAction($request, 'login', 'USERS', [[m
[31m-            'user_id' => $photographer->id,[m
[31m-            'email' => $photographer->email,[m
[31m-        ]);[m
[31m-[m
         return response()->json([[m
             'message' => 'Login successful',[m
             'user' => $photographer,[m
[36m@@ -64,10 +51,6 @@[m [mpublic function login(Request $request)[m
 [m
     }[m
 [m
[31m-        $this->logService->logAction($request, 'login_failed', 'USERS', [[m
[31m-            'email' => $credentials['email'],[m
[31m-        ]);[m
[31m-[m
         return response()->json([[m
             'message' => 'Invalid credentials'[m
         ], 401);[m
[36m@@ -75,17 +58,11 @@[m [mpublic function login(Request $request)[m
 [m
     public function logout(Request $request)[m
     {[m
[31m-        $userId = Auth::id();[m
[31m-        [m
         Auth::guard('web')->logout();[m
 [m
         $request->session()->invalidate();[m
         $request->session()->regenerateToken();[m
 [m
[31m-        $this->logService->logAction($request, 'logout', 'USERS', [[m
[31m-            'user_id' => $userId,[m
[31m-        ]);[m
[31m-[m
         return response()->json([[m
             'message' => 'Logged out successfully'[m
         ], 200);[m
[1mdiff --git a/boardpxl-backend/app/Http/Controllers/InvoiceController.php b/boardpxl-backend/app/Http/Controllers/InvoiceController.php[m
[1mindex ba61d29..e50a786 100644[m
[1m--- a/boardpxl-backend/app/Http/Controllers/InvoiceController.php[m
[1m+++ b/boardpxl-backend/app/Http/Controllers/InvoiceController.php[m
[36m@@ -2,151 +2,127 @@[m
 [m
 namespace App\Http\Controllers;[m
 [m
[32m+[m[32muse Illuminate\Http\JsonResponse;[m
 use Illuminate\Support\Facades\Http;[m
 use Illuminate\Http\Request;[m
 use App\Models\InvoicePayment;[m
 use Illuminate\Support\Facades\DB;[m
 use App\Services\PennylaneService;[m
[31m-use App\Services\LogService;[m
 [m
 [m
 class InvoiceController extends Controller[m
 {[m
[31m-    private LogService $logService;[m
[31m-[m
[31m-    public function __construct(LogService $logService)[m
[31m-    {[m
[31m-        $this->logService = $logService;[m
[31m-    }[m
[32m+[m[32m    /**[m
[32m+[m[32m     * add to the db a turnover invoice with specific information[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param Request $request[m
[32m+[m[32m     * @return JsonResponse[m
[32m+[m[32m     */[m
     public function insertTurnoverInvoice(Request $request)[m
     {[m
[31m-        try {[m
[31m-            // Validation des données entrantes[m
[31m-            $validated = $request->validate([[m
[31m-                'id'=> 'required|numeric',[m
[31m-                'number'=> 'required|string',[m
[31m-                'issue_date'=> 'required|date',[m
[31m-                'due_date'=> 'required|date',[m
[31m-                'description'=> 'nullable|string',[m
[31m-                'raw_value'=> 'required|numeric',[m
[31m-                'commission'=> 'required|numeric',[m
[31m-                'tax'=> 'required|numeric',[m
[31m-                'vat'=> 'required|numeric',[m
[31m-                'start_period'=> 'required|date',[m
[31m-                'end_period'=> 'required|date',[m
[31m-                'link_pdf'=> 'required|string',[m
[31m-                'photographer_id'=> 'required|numeric',[m
[31m-                'pdf_invoice_subject'=> 'required|string',[m
[31m-            ]);[m
[31m-[m
[31m-            // Insertion directe dans la base de données[m
[31m-            DB::table('invoice_payments')->insert([[m
[31m-                'id' => $validated['id'],[m
[31m-                'number' => $validated['number'],[m
[31m-                'issue_date' => $validated['issue_date'],[m
[31m-                'due_date' => $validated['due_date'],[m
[31m-                'description' => $validated['description'],[m
[31m-                'raw_value' => $validated['raw_value'],[m
[31m-                'commission' => $validated['commission'],[m
[31m-                'tax' => $validated['tax'],[m
[31m-                'vat' => $validated['vat'],[m
[31m-                'start_period' => $validated['start_period'],[m
[31m-                'end_period' => $validated['end_period'],[m
[31m-                'link_pdf' => $validated['link_pdf'],[m
[31m-                'photographer_id' => $validated['photographer_id'],[m
[31m-                "pdf_invoice_subject" => $validated['pdf_invoice_subject'],[m
[31m-                'created_at' => now(),[m
[31m-                'updated_at' => now(),[m
[31m-            ]);[m
[31m-[m
[31m-            $this->logService->logAction($request, 'insert_turnover_invoice', 'INVOICE_PAYMENTS', [[m
[31m-                'invoice_id' => $validated['id'],[m
[31m-                'photographer_id' => $validated['photographer_id'],[m
[31m-                'number' => $validated['number'],[m
[31m-            ]);[m
[31m-[m
[31m-            return response()->json([[m
[31m-                'success' => true,[m
[31m-                'message' => 'Invoice stored successfully.',[m
[31m-            ], 201);[m
[31m-        } catch (\Exception $e) {[m
[31m-            $this->logService->logAction($request, 'insert_turnover_invoice_failed', 'INVOICE_PAYMENTS', [[m
[31m-                'error' => $e->getMessage(),[m
[31m-            ]);[m
[31m-[m
[31m-            return response()->json([[m
[31m-                'success' => false,[m
[31m-                'message' => 'Error: ' . $e->getMessage(),[m
[31m-            ], 500);[m
[31m-        }[m
[32m+[m[32m        // Validation des données entrantes[m
[32m+[m[32m        $validated = $request->validate([[m
[32m+[m[32m            'id'=> 'required|numeric',[m
[32m+[m[32m            'number'=> 'required|string',[m
[32m+[m[32m            'issue_date'=> 'required|date',[m
[32m+[m[32m            'due_date'=> 'required|date',[m
[32m+[m[32m            'description'=> 'nullable|string',[m
[32m+[m[32m            'raw_value'=> 'required|numeric',[m
[32m+[m[32m            'commission'=> 'required|numeric',[m
[32m+[m[32m            'tax'=> 'required|numeric',[m
[32m+[m[32m            'vat'=> 'required|numeric',[m
[32m+[m[32m            'start_period'=> 'required|date',[m
[32m+[m[32m            'end_period'=> 'required|date',[m
[32m+[m[32m            'link_pdf'=> 'required|string',[m
[32m+[m[32m            'photographer_id'=> 'required|numeric',[m
[32m+[m[32m            'pdf_invoice_subject'=> 'required|string',[m
[32m+[m[32m        ]);[m
[32m+[m
[32m+[m[32m        // Insertion directe dans la base de données[m
[32m+[m[32m        DB::table('invoice_payments')->insert([[m
[32m+[m[32m            'id' => $validated['id'],[m
[32m+[m[32m            'number' => $validated['number'],[m
[32m+[m[32m            'issue_date' => $validated['issue_date'],[m
[32m+[m[32m            'due_date' => $validated['due_date'],[m
[32m+[m[32m            'description' => $validated['description'],[m
[32m+[m[32m            'raw_value' => $validated['raw_value'],[m
[32m+[m[32m            'commission' => $validated['commission'],[m
[32m+[m[32m            'tax' => $validated['tax'],[m
[32m+[m[32m            'vat' => $validated['vat'],[m
[32m+[m[32m            'start_period' => $validated['start_period'],[m
[32m+[m[32m            'end_period' => $validated['end_period'],[m
[32m+[m[32m            'link_pdf' => $validated['link_pdf'],[m
[32m+[m[32m            'photographer_id' => $validated['photographer_id'],[m
[32m+[m[32m            "pdf_invoice_subject" => $validated['pdf_invoice_subject'],[m
[32m+[m[32m            'created_at' => now(),[m
[32m+[m[32m            'updated_at' => now(),[m
[32m+[m[32m        ]);[m
[32m+[m
[32m+[m[32m        return response()->json([[m
[32m+[m[32m            'success' => true,[m
[32m+[m[32m            'message' => 'Invoice stored successfully.',[m
[32m+[m[32m        ], 201);[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * add to the db a credit invoice with specific information[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param Request $request[m
[32m+[m[32m     * @return JsonResponse[m
[32m+[m[32m     */[m
     public function insertCreditsInvoice(Request $request)[m
     {[m
[31m-        try {[m
[31m-            // Validation des données[m
[31m-            $validated = $request->validate([[m
[31m-                'id' => 'required|numeric',[m
[31m-                'number' => 'required|string',[m
[31m-                'issue_date' => 'required|date',[m
[31m-                'due_date' => 'required|date',[m
[31m-                'description' => 'nullable|string',[m
[31m-                'amount' => 'required|numeric',[m
[31m-                'tax' => 'required|numeric',[m
[31m-                'vat' => 'required|numeric',[m
[31m-                'total_due' => 'required|numeric',[m
[31m-                'credits' => 'required|numeric',[m
[31m-                'status' => 'required|string',[m
[31m-                'link_pdf' => 'required|string',[m
[31m-                'photographer_id' => 'required|numeric',[m
[31m-                'pdf_invoice_subject' => 'required|string',[m
[31m-            ]);[m
[31m-[m
[31m-            // Insert SQL direct[m
[31m-            DB::table('invoice_credits')->insert([[m
[31m-                'id' => $validated['id'],[m
[31m-                'number' => $validated['number'],[m
[31m-                'issue_date' => $validated['issue_date'],[m
[31m-                'due_date' => $validated['due_date'],[m
[31m-                'description' => $validated['description']  ?? 'N/A',[m
[31m-                'amount' => $validated['amount'],[m
[31m-                'tax' => $validated['tax'],[m
[31m-                'vat' => $validated['vat'],[m
[31m-                'total_due' => $validated['total_due'], [m
[31m-                'credits' => $validated['credits'],[m
[31m-                'status' => $validated['status'],[m
[31m-                'link_pdf' => $validated['link_pdf'],[m
[31m-                'photographer_id' => $validated['photographer_id'],[m
[31m-                'pdf_invoice_subject' => $validated['pdf_invoice_subject'],[m
[31m-                'created_at' => now(),[m
[31m-                'updated_at' => now(),[m
[31m-            ]);[m
[31m-[m
[31m-            $this->logService->logAction($request, 'insert_credits_invoice', 'INVOICE_CREDITS', [[m
[31m-                'invoice_id' => $validated['id'],[m
[31m-                'photographer_id' => $validated['photographer_id'],[m
[31m-                'number' => $validated['number'],[m
[31m-                'credits' => $validated['credits'],[m
[31m-            ]);[m
[31m-[m
[31m-            return response()->json([[m
[31m-                'success' => true,[m
[31m-                'message' => 'Credit invoice stored successfully.',[m
[31m-            ], 201);[m
[31m-        } catch (\Exception $e) {[m
[31m-            $this->logService->logAction($request, 'insert_credits_invoice_failed', 'INVOICE_CREDITS', [[m
[31m-                'error' => $e->getMessage(),[m
[31m-            ]);[m
[31m-[m
[31m-            return response()->json([[m
[31m-                'success' => false,[m
[31m-                'message' => 'Error: ' . $e->getMessage(),[m
[31m-            ], 500);[m
[31m-        }[m
[32m+[m[32m        // Validation des données[m
[32m+[m[32m        $validated = $request->validate([[m
[32m+[m[32m            'id' => 'required|numeric',[m
[32m+[m[32m            'number' => 'required|string',[m
[32m+[m[32m            'issue_date' => 'required|date',[m
[32m+[m[32m            'due_date' => 'required|date',[m
[32m+[m[32m            'description' => 'nullable|string',[m
[32m+[m[32m            'amount' => 'required|numeric',[m
[32m+[m[32m            'tax' => 'required|numeric',[m
[32m+[m[32m            'vat' => 'required|numeric',[m
[32m+[m[32m            'total_due' => 'required|numeric',[m
[32m+[m[32m            'credits' => 'required|numeric',[m
[32m+[m[32m            'status' => 'required|string',[m
[32m+[m[32m            'link_pdf' => 'required|string',[m
[32m+[m[32m            'photographer_id' => 'required|numeric',[m
[32m+[m[32m            'pdf_invoice_subject' => 'required|string',[m
[32m+[m[32m        ]);[m
[32m+[m
[32m+[m[32m        // Insert SQL direct[m
[32m+[m[32m        DB::table('invoice_credits')->insert([[m
[32m+[m[32m            'id' => $validated['id'],[m
[32m+[m[32m            'number' => $validated['number'],[m
[32m+[m[32m            'issue_date' => $validated['issue_date'],[m
[32m+[m[32m            'due_date' => $validated['due_date'],[m
[32m+[m[32m            'description' => $validated['description']  ?? 'N/A',[m
[32m+[m[32m            'amount' => $validated['amount'],[m
[32m+[m[32m            'tax' => $validated['tax'],[m
[32m+[m[32m            'vat' => $validated['vat'],[m
[32m+[m[32m            'total_due' => $validated['total_due'],[m
[32m+[m[32m            'credits' => $validated['credits'],[m
[32m+[m[32m            'status' => $validated['status'],[m
[32m+[m[32m            'link_pdf' => $validated['link_pdf'],[m
[32m+[m[32m            'photographer_id' => $validated['photographer_id'],[m
[32m+[m[32m            'pdf_invoice_subject' => $validated['pdf_invoice_subject'],[m
[32m+[m[32m            'created_at' => now(),[m
[32m+[m[32m            'updated_at' => now(),[m
[32m+[m[32m        ]);[m
[32m+[m
[32m+[m[32m        return response()->json([[m
[32m+[m[32m            'success' => true,[m
[32m+[m[32m            'message' => 'Credit invoice stored successfully.',[m
[32m+[m[32m        ], 201);[m
     }[m
 [m
[31m-    [m
[31m-    public function getInvoicesPaymentByPhotographer(Request $request, $photographer_id)[m
[32m+[m[32m    /**[m
[32m+[m[32m     * get all payment invoices from a photographer[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param int $photographer_id[m
[32m+[m[32m     * @return JsonResponse[m
[32m+[m[32m     */[m
[32m+[m[32m    public function getInvoicesPaymentByPhotographer($photographer_id)[m
     {[m
         try {[m
         if (!is_numeric($photographer_id)) {[m
[36m@@ -159,7 +135,6 @@[m [mpublic function getInvoicesPaymentByPhotographer(Request $request, $photographer[m
             $invoices = DB::table('invoice_payments')[m
                 ->where('photographer_id', $photographer_id)[m
                 ->get();[m
[31m-            [m
             return response()->json($invoices);[m
         } catch (\Exception $e) {[m
             return response()->json([[m
[36m@@ -169,7 +144,13 @@[m [mpublic function getInvoicesPaymentByPhotographer(Request $request, $photographer[m
         }[m
     }[m
 [m
[31m-    public function getInvoicesCreditByPhotographer(Request $request, $photographer_id)[m
[32m+[m[32m    /**[m
[32m+[m[32m     * get all credit invoices from a photographer[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param int $photographer_id[m
[32m+[m[32m     * @return JsonResponse[m
[32m+[m[32m     */[m
[32m+[m[32m    public function getInvoicesCreditByPhotographer($photographer_id)[m
     {[m
         try {[m
         if (!is_numeric($photographer_id)) {[m
[36m@@ -182,7 +163,6 @@[m [mpublic function getInvoicesCreditByPhotographer(Request $request, $photographer_[m
         $invoices = DB::table('invoice_credits')[m
             ->where('photographer_id', $photographer_id)[m
             ->get();[m
[31m-        [m
         return response()->json($invoices);[m
         } catch (\Exception $e) {[m
             return response()->json([[m
[1mdiff --git a/boardpxl-backend/app/Http/Controllers/LogsController.php b/boardpxl-backend/app/Http/Controllers/LogsController.php[m
[1mdeleted file mode 100644[m
[1mindex 58d6933..0000000[m
[1m--- a/boardpxl-backend/app/Http/Controllers/LogsController.php[m
[1m+++ /dev/null[m
[36m@@ -1,35 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-namespace App\Http\Controllers;[m
[31m-[m
[31m-use Illuminate\Support\Facades\Http;[m
[31m-use Illuminate\Http\Request;[m
[31m-use App\Services\PennylaneService;[m
[31m-use App\Services\MailService;[m
[31m-use Illuminate\Support\Facades\DB;[m
[31m-use Illuminate\Support\Facades\Mail;[m
[31m-use App\Services\LogService;[m
[31m-[m
[31m-[m
[31m-class LogsController extends Controller[m
[31m-{[m
[31m-    // send logs from database[m
[31m-    public function getLogs(Request $request)[m
[31m-    {[m
[31m-        try {[m
[31m-            $logs = DB::table('logs')[m
[31m-                ->join('log_actions', 'logs.action_id', '=', 'log_actions.id')[m
[31m-                ->join('photographers', 'logs.user_id', '=', 'photographers.id')[m
[31m-                ->select('logs.*', 'log_actions.action', 'photographers.name as photographer_name')[m
[31m-                ->orderBy('logs.created_at', 'desc')[m
[31m-                ->get();[m
[31m-[m
[31m-            return response()->json($logs);[m
[31m-        } catch (\Exception $e) {[m
[31m-            return response()->json([[m
[31m-                'success' => false,[m
[31m-                'message' => 'Error: ' . $e->getMessage(),[m
[31m-            ], 500);[m
[31m-        }[m
[31m-    }[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/app/Http/Controllers/MailController.php b/boardpxl-backend/app/Http/Controllers/MailController.php[m
[1mindex f6ad74d..ea1fbf4 100644[m
[1m--- a/boardpxl-backend/app/Http/Controllers/MailController.php[m
[1m+++ b/boardpxl-backend/app/Http/Controllers/MailController.php[m
[36m@@ -5,19 +5,9 @@[m
 use Illuminate\Http\Request;[m
 use App\Services\MailService;[m
 use Illuminate\Support\Facades\Mail;[m
[31m-use App\Models\MailLogs;[m
[31m-use App\Services\LogService;[m
 [m
 class MailController extends Controller[m
 {[m
[31m-    private LogService $logService;[m
[31m-[m
[31m-    public function __construct(LogService $logService)[m
[31m-    {[m
[31m-        $this->logService = $logService;[m
[31m-    }[m
[31m-[m
[31m-[m
     /**[m
      * Envoi de mail via MailService[m
      */[m
[36m@@ -28,7 +18,6 @@[m [mpublic function sendEmail(Request $request, MailService $mailService)[m
             'from' => 'required|email',[m
             'subject' => 'required|string|max:255',[m
             'body' => 'required|string|max:10000',[m
[31m-            'type' => 'nullable|string|max:100',[m
         ]);[m
 [m
         try {[m
[36m@@ -39,41 +28,12 @@[m [mpublic function sendEmail(Request $request, MailService $mailService)[m
                 $validated['body'][m
             );[m
 [m
[31m-            MailLogs::create([[m
[31m-                'sender_id' => auth()->id(), [m
[31m-                'recipient' => $validated['to'],[m
[31m-                'subject' => $validated['subject'],[m
[31m-                'body' => $validated['body'],[m
[31m-                'status' => 'sent',[m
[31m-                'type' => $validated['type'] ?? 'generic'[m
[31m-            ]);[m
[31m-[m
[31m-            $this->logService->logAction($request, 'send_email', 'MAIL_LOGS', [[m
[31m-                'to' => $validated['to'],[m
[31m-                'subject' => $validated['subject'],[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => true,[m
                 'message' => 'Email sent successfully.'[m
             ]);[m
 [m
         } catch (\Exception $e) {[m
[31m-            MailLogs::create([[m
[31m-                'sender_id' => auth()->id(), [m
[31m-                'recipient' => $validated['to'],[m
[31m-                'subject' => $validated['subject'],[m
[31m-                'body' => $validated['body'],[m
[31m-                'status' => 'failed',[m
[31m-                'type' => $validated['type'] ?? 'generic'[m
[31m-            ]);[m
[31m-[m
[31m-            $this->logService->logAction($request, 'send_email_failed', 'MAIL_LOGS', [[m
[31m-                'to' => $validated['to'],[m
[31m-                'subject' => $validated['subject'],[m
[31m-                'error' => $e->getMessage(),[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => false,[m
                 'message' => 'Failed to send email: ' . $e->getMessage()[m
[36m@@ -97,24 +57,4 @@[m [mpublic function testMail()[m
 [m
         return response()->json(['message' => 'Mail envoyé (si tout va bien) !']);[m
     }[m
[31m-[m
[31m-    public function getLogs(Request $request, $sender_id)[m
[31m-    {[m
[31m-        try {[m
[31m-            // Valider l'ID du photographe passé en paramètre[m
[31m-            $validated = validator([m
[31m-                ['sender_id' => $sender_id],[m
[31m-                ['sender_id' => 'required|integer|exists:photographers,id'][m
[31m-            )->validate();[m
[31m-[m
[31m-            // Récupérer les logs de mails depuis la base de données via l'id du photographe validé[m
[31m-            $logs = MailLogs::where('sender_id', $validated['sender_id'])->get();[m
[31m-            return response()->json($logs);[m
[31m-        } catch (\Exception $e) {[m
[31m-            return response()->json([[m
[31m-                'success' => false,[m
[31m-                'message' => 'Failed to retrieve logs: ' . $e->getMessage()[m
[31m-            ], 500);[m
[31m-        }[m
[31m-    }[m
 }[m
[1mdiff --git a/boardpxl-backend/app/Http/Controllers/PennyLaneController.php b/boardpxl-backend/app/Http/Controllers/PennyLaneController.php[m
[1mindex 3cff478..465a712 100644[m
[1m--- a/boardpxl-backend/app/Http/Controllers/PennyLaneController.php[m
[1m+++ b/boardpxl-backend/app/Http/Controllers/PennyLaneController.php[m
[36m@@ -6,17 +6,10 @@[m
 use Illuminate\Http\Request;[m
 use App\Services\PennylaneService;[m
 use App\Services\MailService;[m
[31m-use App\Services\LogService;[m
[32m+[m[32muse Illuminate\Support\Facades\Mail;[m
 [m
 class PennyLaneController extends Controller[m
 {[m
[31m-    private LogService $logService;[m
[31m-[m
[31m-    public function __construct(LogService $logService)[m
[31m-    {[m
[31m-        $this->logService = $logService;[m
[31m-    }[m
[31m-[m
     /**[m
      * Création d'une facture d'achat de crédit Pennylane[m
      */[m
[36m@@ -47,12 +40,6 @@[m [mpublic function createCreditsInvoiceClient(Request $request, PennylaneService $s[m
                 $validated['invoiceTitle'][m
             );[m
 [m
[31m-            $this->logService->logAction($request, 'create_credits_invoice_client', 'INVOICE_CREDITS', [[m
[31m-                'id_client' => (int) $validated['idClient'],[m
[31m-                'invoice_title' => $validated['invoiceTitle'],[m
[31m-                'amount_euro' => $validated['amountEuro'],[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => true,[m
                 'message' => 'Facture créée avec succès.',[m
[36m@@ -60,10 +47,6 @@[m [mpublic function createCreditsInvoiceClient(Request $request, PennylaneService $s[m
             ]);[m
 [m
         } catch (\Exception $e) {[m
[31m-            $this->logService->logAction($request, 'create_credits_invoice_client_failed', 'INVOICE_CREDITS', [[m
[31m-                'error' => $e->getMessage(),[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => false,[m
                 'message' => 'Erreur : ' . $e->getMessage(),[m
[36m@@ -97,12 +80,6 @@[m [mpublic function createTurnoverPaymentInvoice(Request $request, PennylaneService[m
                 $validated['invoiceDescription'][m
             );[m
 [m
[31m-            $this->logService->logAction($request, 'create_turnover_payment_invoice', 'INVOICE_PAYMENTS', [[m
[31m-                'id_client' => (int) $validated['idClient'],[m
[31m-                'invoice_title' => $validated['invoiceTitle'],[m
[31m-                'amount_euro' => $validated['amountEuro'],[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => true,[m
                 'message' => 'Facture créée avec succès.',[m
[36m@@ -110,10 +87,6 @@[m [mpublic function createTurnoverPaymentInvoice(Request $request, PennylaneService[m
             ]);[m
 [m
         } catch (\Exception $e) {[m
[31m-            $this->logService->logAction($request, 'create_turnover_payment_invoice_failed', 'INVOICE_PAYMENTS', [[m
[31m-                'error' => $e->getMessage(),[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => false,[m
                 'message' => 'Erreur : ' . $e->getMessage(),[m
[36m@@ -133,21 +106,12 @@[m [mpublic function getClientId(Request $request, PennylaneService $service)[m
         $clientId = $service->getClientIdByName($validated['name']);[m
 [m
         if ($clientId) {[m
[31m-            $this->logService->logAction($request, 'lookup_client_id', 'PHOTOGRAPHERS', [[m
[31m-                'name' => $validated['name'],[m
[31m-                'client_id' => $clientId,[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => true,[m
                 'client_id' => $clientId[m
             ]);[m
         }[m
 [m
[31m-        $this->logService->logAction($request, 'lookup_client_id_not_found', 'PHOTOGRAPHERS', [[m
[31m-            'name' => $validated['name'],[m
[31m-        ]);[m
[31m-[m
         return response()->json([[m
             'success' => false,[m
             'message' => 'Client non trouvé'[m
[36m@@ -159,9 +123,7 @@[m [mpublic function getClientId(Request $request, PennylaneService $service)[m
      */[m
     public function getInvoices(PennylaneService $service)[m
     {[m
[31m-        $invoices = $service->getInvoices();[m
[31m-[m
[31m-        return response()->json($invoices);[m
[32m+[m[32m        return response()->json($service->getInvoices());[m
     }[m
 [m
     /**[m
[36m@@ -169,9 +131,7 @@[m [mpublic function getInvoices(PennylaneService $service)[m
      */[m
     public function getInvoicesByClient($idClient, PennylaneService $service)[m
     {[m
[31m-        $invoices = $service->getInvoicesByIdClient($idClient);[m
[31m-[m
[31m-        return response()->json($invoices);[m
[32m+[m[32m        return response()->json($service->getInvoicesByIdClient($idClient));[m
     }[m
 [m
     /**[m
[36m@@ -211,23 +171,12 @@[m [mpublic function sendEmail(Request $request, MailService $mailService)[m
                 $validated['body'][m
             );[m
 [m
[31m-            $this->logService->logAction($request, 'send_email', 'MAIL_LOGS', [[m
[31m-                'to' => $validated['to'],[m
[31m-                'subject' => $validated['subject'],[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => true,[m
                 'message' => 'Email sent successfully.'[m
             ]);[m
 [m
         } catch (\Exception $e) {[m
[31m-            $this->logService->logAction($request, 'send_email_failed', 'MAIL_LOGS', [[m
[31m-                'to' => $validated['to'],[m
[31m-                'subject' => $validated['subject'],[m
[31m-                'error' => $e->getMessage(),[m
[31m-            ]);[m
[31m-[m
             return response()->json([[m
                 'success' => false,[m
                 'message' => 'Failed to send email: ' . $e->getMessage()[m
[36m@@ -243,7 +192,6 @@[m [mpublic function downloadInvoice(Request $request)[m
         $fileUrl = $request->input('file_url');[m
 [m
         if (!$fileUrl) {[m
[31m-            $this->logService->logAction($request, 'download_invoice_proxy_missing_url', 'INVOICE_CREDITS | INVOICE_PAYMENTS', []);[m
             return response('Aucun fichier spécifié.', 400);[m
         }[m
 [m
[36m@@ -253,10 +201,6 @@[m [mpublic function downloadInvoice(Request $request)[m
         // Déterminer le nom du fichier[m
         $fileName = 'facture.pdf';[m
 [m
[31m-        $this->logService->logAction($request, 'download_invoice_proxy', 'INVOICE_CREDITS | INVOICE_PAYMENTS', [[m
[31m-            'file_url' => $fileUrl,[m
[31m-        ]);[m
[31m-[m
         // Retourner le fichier en réponse avec les headers[m
         return response($fileContent, 200)[m
             ->header('Content-Type', 'application/pdf')[m
[36m@@ -267,10 +211,6 @@[m [mpublic function getPhotographers(PennylaneService $service)[m
     {[m
         $photographers = $service->getPhotographers();[m
 [m
[31m-        $this->logService->logAction(request(), 'list_photographers', 'PHOTOGRAPHERS', [[m
[31m-            'count' => is_countable($photographers) ? count($photographers) : null,[m
[31m-        ]);[m
[31m-[m
         return response()->json([[m
             $photographers[m
           ]);[m
[36m@@ -282,10 +222,6 @@[m [mpublic function getListClients(PennylaneService $service)[m
     {[m
         $clients = $service->getListClients();[m
 [m
[31m-        $this->logService->logAction(request(), 'list_clients', 'PHOTOGRAPHERS', [[m
[31m-            'count' => is_countable($clients) ? count($clients) : null,[m
[31m-        ]);[m
[31m-[m
         return response()->json([[m
             'success' => true,[m
             'clients' => $clients[m
[36m@@ -302,5 +238,4 @@[m [mpublic function getInvoiceById($id, PennylaneService $service)[m
 [m
         return response()->json($invoice);[m
     }[m
[31m-[m
 }[m
[1mdiff --git a/boardpxl-backend/app/Http/Controllers/PhotographerController.php b/boardpxl-backend/app/Http/Controllers/PhotographerController.php[m
[1mindex ee7cc85..1a4d654 100644[m
[1m--- a/boardpxl-backend/app/Http/Controllers/PhotographerController.php[m
[1m+++ b/boardpxl-backend/app/Http/Controllers/PhotographerController.php[m
[36m@@ -2,48 +2,18 @@[m
 [m
 namespace App\Http\Controllers;[m
 [m
[31m-use Illuminate\Http\Request;[m
[31m-use App\Models\Photographer;[m
 use Illuminate\Support\Facades\Http;[m
[32m+[m[32muse Illuminate\Http\Request;[m
 use App\Services\PennylaneService;[m
 use App\Services\MailService;[m
 use Illuminate\Support\Facades\DB;[m
 use Illuminate\Support\Facades\Mail;[m
[31m-use App\Services\LogService;[m
 [m
 class PhotographerController extends Controller[m
 {[m
[31m-    private LogService $logService;[m
[31m-[m
[31m-    public function __construct(LogService $logService)[m
[31m-    {[m
[31m-        $this->logService = $logService;[m
[31m-    }[m
[31m-[m
[31m-    [m
[31m-    public function getPhotographer($id)[m
[31m-    {[m
[31m-        $photographer = Photographer::find($id);[m
[31m-[m
[31m-        if (!$photographer)[m
[31m-        {[m
[31m-            return response()->json(['message' => 'Photographe non trouvé'], 404);[m
[31m-        }[m
[31m-[m
[31m-        return response()->json($photographer);[m
[31m-    }[m
[31m-  [m
     public function getPhotographers()[m
     {[m
[31m-        try {[m
[31m-            $photographers = DB::table('photographers')->get();[m
[31m-            [m
[31m-            return response()->json($photographers);[m
[31m-        } catch (\Exception $e) {[m
[31m-            return response()->json([[m
[31m-                'success' => false,[m
[31m-                'message' => 'Error: ' . $e->getMessage(),[m
[31m-            ], 500);[m
[31m-        }[m
[32m+[m[32m        $photographers = DB::table('photographers')->get();[m
[32m+[m[32m        return response()->json($photographers);[m
     }[m
 }[m
[1mdiff --git a/boardpxl-backend/app/Http/Kernel.php b/boardpxl-backend/app/Http/Kernel.php[m
[1mindex 8e8c5b4..f6ac9ef 100644[m
[1m--- a/boardpxl-backend/app/Http/Kernel.php[m
[1m+++ b/boardpxl-backend/app/Http/Kernel.php[m
[36m@@ -63,5 +63,7 @@[m [mclass Kernel extends HttpKernel[m
         'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,[m
         'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,[m
         'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,[m
[32m+[m[32m        'sync.pennylane' => \App\Http\Middleware\SyncPennyLaneData::class,[m
     ];[m
 }[m
[41m+[m
[1mdiff --git a/boardpxl-backend/app/Http/Middleware/SyncPennyLaneData.php b/boardpxl-backend/app/Http/Middleware/SyncPennyLaneData.php[m
[1mnew file mode 100644[m
[1mindex 0000000..bb6a138[m
[1m--- /dev/null[m
[1m+++ b/boardpxl-backend/app/Http/Middleware/SyncPennyLaneData.php[m
[36m@@ -0,0 +1,28 @@[m
[32m+[m[32m<?php[m
[32m+[m
[32m+[m[32mnamespace App\Http\Middleware;[m
[32m+[m
[32m+[m[32muse Closure;[m
[32m+[m[32muse Illuminate\Http\Request;[m
[32m+[m[32muse Illuminate\Support\Facades\Cache;[m
[32m+[m[32muse App\Services\PennyLaneService;[m
[32m+[m
[32m+[m[32mclass SyncPennyLaneData[m
[32m+[m[32m{[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Handle an incoming request.[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param  \Illuminate\Http\Request  $request[m
[32m+[m[32m     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next[m
[32m+[m[32m     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse[m
[32m+[m[32m     */[m
[32m+[m[32m    public function handle(Request $request, Closure $next)[m
[32m+[m[32m    {[m
[32m+[m[32m        if (!Cache::has('pennylane_last_sync')) {[m
[32m+[m[32m            app(PennyLaneService::class)->syncInvoices();[m
[32m+[m[32m            Cache::put('pennylane_last_sync', now(), now()->addMinutes(5));[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        return $next($request);[m
[32m+[m[32m    }[m
[32m+[m[32m}[m
[1mdiff --git a/boardpxl-backend/app/Jobs/SyncInvoicesJob.php b/boardpxl-backend/app/Jobs/SyncInvoicesJob.php[m
[1mnew file mode 100644[m
[1mindex 0000000..bc5a033[m
[1m--- /dev/null[m
[1m+++ b/boardpxl-backend/app/Jobs/SyncInvoicesJob.php[m
[36m@@ -0,0 +1,25 @@[m
[32m+[m[32m<?php[m
[32m+[m
[32m+[m[32mnamespace App\Jobs;[m
[32m+[m
[32m+[m[32muse App\Services\PennyLaneService;[m
[32m+[m
[32m+[m[32mclass SyncInvoicesJob extends Job[m
[32m+[m[32m{[m
[32m+[m[32m    protected $service;[m
[32m+[m
[32m+[m[32m    public function __construct(PennyLaneService $service)[m
[32m+[m[32m    {[m
[32m+[m[32m        $this->service = $service;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Execute the job.[m
[32m+[m[32m     *[m
[32m+[m[32m     * @return void[m
[32m+[m[32m     */[m
[32m+[m[32m    public function handle()[m
[32m+[m[32m    {[m
[32m+[m[32m        $this->service->syncInvoices();[m
[32m+[m[32m    }[m
[32m+[m[32m}[m
[1mdiff --git a/boardpxl-backend/app/Models/InvoiceCredit.php b/boardpxl-backend/app/Models/InvoiceCredit.php[m
[1mindex b7d534f..31520f4 100644[m
[1m--- a/boardpxl-backend/app/Models/InvoiceCredit.php[m
[1m+++ b/boardpxl-backend/app/Models/InvoiceCredit.php[m
[36m@@ -21,12 +21,33 @@[m [mclass InvoiceCredit extends Model[m
         'credits',[m
         'status',[m
         'link_pdf',[m
[31m-        'pdf_invoice_subject'[m
[32m+[m[32m        'pdf_invoice_subject',[m
[32m+[m
[32m+[m[32m        'external_id',[m
[32m+[m[32m        'pennylane_invoice_number',[m
[32m+[m[32m        'customer_name',[m
[32m+[m[32m        'total_amount',[m
[32m+[m[32m        'currency',[m
[32m+[m[32m        'issued_at',[m
[32m+[m[32m        'due_at',[m
[32m+[m[32m        'updated_at_api',[m
[32m+[m[32m    ];[m
[32m+[m
[32m+[m[32m    protected $dates = [[m
[32m+[m[32m        'issue_date',[m
[32m+[m[32m        'due_date',[m
[32m+[m[32m        'issued_at',[m
[32m+[m[32m        'due_at',[m
[32m+[m[32m        'updated_at_api'[m
     ];[m
 [m
     protected $casts = [[m
[31m-        'issue_date' => 'date',[m
[31m-        'due_date' => 'date',[m
[32m+[m[32m        'amount' => 'decimal:2',[m
[32m+[m[32m        'tax' => 'decimal:2',[m
[32m+[m[32m        'vat' => 'decimal:2',[m
[32m+[m[32m        'total_due' => 'decimal:2',[m
[32m+[m[32m        'total_amount' => 'decimal:2',[m
[32m+[m[32m        'credits' => 'integer',[m
     ];[m
 [m
     public function photographer()[m
[1mdiff --git a/boardpxl-backend/app/Models/InvoicePayment.php b/boardpxl-backend/app/Models/InvoicePayment.php[m
[1mindex 69c4608..8549002 100644[m
[1m--- a/boardpxl-backend/app/Models/InvoicePayment.php[m
[1m+++ b/boardpxl-backend/app/Models/InvoicePayment.php[m
[36m@@ -21,14 +21,18 @@[m [mclass InvoicePayment extends Model[m
         'start_period',[m
         'end_period',[m
         'link_pdf',[m
[31m-        'pdf_invoice_subject'[m
[32m+[m[32m        'pdf_invoice_subject',[m
[32m+[m[32m    ];[m
[32m+[m
[32m+[m[32m    protected $dates = [[m
[32m+[m[32m        'issue_date',[m
[32m+[m[32m        'due_date',[m
     ];[m
 [m
     protected $casts = [[m
[31m-        'issue_date' => 'date',[m
[31m-        'due_date' => 'date',[m
[31m-        'start_period' => 'date',[m
[31m-        'end_period' => 'date',[m
[32m+[m[32m        'tax' => 'decimal:2',[m
[32m+[m[32m        'vat' => 'decimal:2',[m
[32m+[m[32m        'raw_value' => 'decimal:2',[m
     ];[m
 [m
     public function photographer()[m
[1mdiff --git a/boardpxl-backend/app/Models/LogActions.php b/boardpxl-backend/app/Models/LogActions.php[m
[1mdeleted file mode 100644[m
[1mindex dda42e4..0000000[m
[1m--- a/boardpxl-backend/app/Models/LogActions.php[m
[1m+++ /dev/null[m
[36m@@ -1,16 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-namespace App\Models;[m
[31m-[m
[31m-use Illuminate\Database\Eloquent\Factories\HasFactory;[m
[31m-use Illuminate\Database\Eloquent\Model;[m
[31m-[m
[31m-class LogActions extends Model[m
[31m-{[m
[31m-    use HasFactory;[m
[31m-[m
[31m-    protected $fillable = [[m
[31m-        'action',[m
[31m-        'permission',[m
[31m-    ];[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/app/Models/Logs.php b/boardpxl-backend/app/Models/Logs.php[m
[1mdeleted file mode 100644[m
[1mindex 0188f1a..0000000[m
[1m--- a/boardpxl-backend/app/Models/Logs.php[m
[1m+++ /dev/null[m
[36m@@ -1,19 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-namespace App\Models;[m
[31m-[m
[31m-use Illuminate\Database\Eloquent\Factories\HasFactory;[m
[31m-use Illuminate\Database\Eloquent\Model;[m
[31m-[m
[31m-class Logs extends Model[m
[31m-{[m
[31m-    use HasFactory;[m
[31m-[m
[31m-    protected $fillable = [[m
[31m-        'action_id',[m
[31m-        'user_id',[m
[31m-        'table_name',[m
[31m-        'ip_address',[m
[31m-        'details',[m
[31m-    ];[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/app/Models/MailLogs.php b/boardpxl-backend/app/Models/MailLogs.php[m
[1mdeleted file mode 100644[m
[1mindex 98810d8..0000000[m
[1m--- a/boardpxl-backend/app/Models/MailLogs.php[m
[1m+++ /dev/null[m
[36m@@ -1,25 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-namespace App\Models;[m
[31m-[m
[31m-use Illuminate\Database\Eloquent\Factories\HasFactory;[m
[31m-use Illuminate\Database\Eloquent\Model;[m
[31m-[m
[31m-class MailLogs extends Model[m
[31m-{[m
[31m-    use HasFactory;[m
[31m-[m
[31m-    protected $fillable = [[m
[31m-        'sender_id',[m
[31m-        'recipient',[m
[31m-        'subject',[m
[31m-        'status',[m
[31m-        'body',[m
[31m-        'type'[m
[31m-    ];[m
[31m-[m
[31m-    public function photographer()[m
[31m-    {[m
[31m-        return $this->belongsTo(Photographer::class, 'sender_id');[m
[31m-    }[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/app/Models/Photographer.php b/boardpxl-backend/app/Models/Photographer.php[m
[1mindex eac2f79..6b10d9f 100644[m
[1m--- a/boardpxl-backend/app/Models/Photographer.php[m
[1m+++ b/boardpxl-backend/app/Models/Photographer.php[m
[36m@@ -3,9 +3,6 @@[m
 namespace App\Models;[m
 [m
 use Illuminate\Database\Eloquent\Factories\HasFactory;[m
[31m-use Illuminate\Database\Eloquent\Model;[m
[31m-use Illuminate\Support\Facades\DB;[m
[31m-use Ramsey\Collection\Collection;[m
 use Illuminate\Foundation\Auth\User as Authenticatable;[m
 use Illuminate\Support\Facades\Hash;[m
 use Laravel\Sanctum\HasApiTokens;[m
[36m@@ -57,17 +54,4 @@[m [mpublic function invoicesPayment()[m
     {[m
         return $this->hasMany(InvoicePayment::class);[m
     }[m
[31m-[m
[31m-    public function mailLogs()[m
[31m-    {[m
[31m-        return $this->hasMany(MailLogs::class, 'sender_id');[m
[31m-    }[m
[31m-[m
[31m-    public function findProfilData(string $email)[m
[31m-    {[m
[31m-        return DB::table('photographers')[m
[31m-            ->select('email', 'family_name', 'given_name', 'name', 'nb_imported_photos', 'total_limit', 'street_address', 'postal_code', 'locality', 'country')[m
[31m-            ->where('email', $email)[m
[31m-            ->first();[m
[31m-    }[m
 }[m
[1mdiff --git a/boardpxl-backend/app/Services/LogService.php b/boardpxl-backend/app/Services/LogService.php[m
[1mdeleted file mode 100644[m
[1mindex 5cbe483..0000000[m
[1m--- a/boardpxl-backend/app/Services/LogService.php[m
[1m+++ /dev/null[m
[36m@@ -1,47 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-namespace App\Services;[m
[31m-[m
[31m-use Illuminate\Http\Request;[m
[31m-use App\Models\Logs;[m
[31m-use App\Models\LogActions;[m
[31m-use Illuminate\Support\Facades\Auth;[m
[31m-[m
[31m-class LogService[m
[31m-{[m
[31m-    private static $actionCache = [];[m
[31m-[m
[31m-    public function logAction(Request $request, string $action, ?string $tableName = null, array $details = []): void[m
[31m-    {[m
[31m-        $userId = Auth::id() ?? optional($request->user())->id;[m
[31m-[m
[31m-        if (!$userId) {[m
[31m-            return;[m
[31m-        }[m
[31m-[m
[31m-        // Get action_id from cache or database[m
[31m-        $actionId = $this->getActionId($action);[m
[31m-        [m
[31m-        if (!$actionId) {[m
[31m-            return; // Skip if action not found[m
[31m-        }[m
[31m-[m
[31m-        Logs::create([[m
[31m-            'action_id' => $actionId,[m
[31m-            'user_id' => $userId,[m
[31m-            'table_name' => $tableName ? strtoupper($tableName) : null,[m
[31m-            'ip_address' => $request->ip(),[m
[31m-            'details' => $details ? json_encode($details) : null,[m
[31m-        ]);[m
[31m-    }[m
[31m-[m
[31m-    private function getActionId(string $action): ?int[m
[31m-    {[m
[31m-        if (!isset(self::$actionCache[$action])) {[m
[31m-            $logAction = LogActions::where('action', $action)->first();[m
[31m-            self::$actionCache[$action] = $logAction ? $logAction->id : null;[m
[31m-        }[m
[31m-        [m
[31m-        return self::$actionCache[$action];[m
[31m-    }[m
[31m-}[m
\ No newline at end of file[m
[1mdiff --git a/boardpxl-backend/app/Services/PennyLaneService.php b/boardpxl-backend/app/Services/PennyLaneService.php[m
[1mindex 8e7abaf..e703d04 100644[m
[1m--- a/boardpxl-backend/app/Services/PennyLaneService.php[m
[1m+++ b/boardpxl-backend/app/Services/PennyLaneService.php[m
[36m@@ -3,12 +3,25 @@[m
 namespace App\Services;[m
 [m
 use GuzzleHttp\Client;[m
[32m+[m[32muse App\Models\Invoice;[m
[32m+[m[32muse Illuminate\Support\Facades\Log;[m
[32m+[m[32muse Carbon\Carbon;[m
 [m
 class PennylaneService[m
 {[m
[32m+[m[32m    /**[m
[32m+[m[32m     *[m
[32m+[m[32m     *[m
[32m+[m[32m     *[m
[32m+[m[32m     * */[m
     protected $client;[m
     protected $token;[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     *[m
[32m+[m[32m     *[m
[32m+[m[32m     *[m
[32m+[m[32m     * */[m
     public function __construct()[m
     {[m
         $this->token = config('services.pennylane.token');[m
[36m@@ -23,23 +36,37 @@[m [mpublic function __construct()[m
         ]);[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     *[m
[32m+[m[32m     *[m
[32m+[m[32m     * @return Client[m
[32m+[m[32m     * */[m
     public function getHttpClient(): Client[m
     {[m
         return $this->client;[m
     }[m
 [m
[31m-    // Récupérer toutes les factures[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Get all invoices[m
[32m+[m[32m     *[m
[32m+[m[32m     * @return array[m
[32m+[m[32m     * */[m
     public function getInvoices()[m
     {[m
         $allInvoices = [];[m
         $cursor = null;[m
 [m
[32m+[m[32m        $lastSync = Invoice::max('updated_at_api');[m
[32m+[m
[32m+[m[32m        $updatedAfter = $lastSync ? $lastSync->toIso8601String() : null;[m
[32m+[m
         do {[m
             $response = $this->client->get('customer_invoices', [[m
                 'query' => array_filter([[m
                     'limit' => 100,[m
                     'cursor' => $cursor,[m
                     'sort' => '-id',[m
[32m+[m[32m                    'updated_after' => $updatedAfter[m
                 ])[m
             ]);[m
 [m
[36m@@ -64,6 +91,12 @@[m [mpublic function getInvoices()[m
         return $allInvoices;[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * Get the invoice with a specific number[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param string $invoiceNumber[m
[32m+[m[32m     * @return array[m
[32m+[m[32m     * */[m
     public function getInvoiceByNumber(string $invoiceNumber): ?array[m
     {[m
         $allInvoices = $this->getInvoices();[m
[36m@@ -77,8 +110,12 @@[m [mpublic function getInvoiceByNumber(string $invoiceNumber): ?array[m
         return null; // Facture non trouvée[m
     }[m
 [m
[31m-[m
[31m-    // Récupérer les factures d'un client par son ID[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Get all the invoices of a specific Client[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param int $idClient[m
[32m+[m[32m     * @return array[m
[32m+[m[32m     * */[m
     public function getInvoicesByIdClient(int $idClient): array[m
     {[m
         $allInvoices = $this->getInvoices();[m
[36m@@ -90,7 +127,12 @@[m [mpublic function getInvoicesByIdClient(int $idClient): array[m
         return array_values($clientInvoices); // Ré-indexe le tableau[m
     }[m
 [m
[31m-    // Récupérer l'ID client par nom et prénom[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Get the id of a specific client name[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param string $name[m
[32m+[m[32m     * @return int[m
[32m+[m[32m     * */[m
     public function getClientIdByName(string $name): ?int[m
     {[m
         // Récupérer tous les clients[m
[36m@@ -108,8 +150,19 @@[m [mpublic function getClientIdByName(string $name): ?int[m
         return null; // Aucun client trouvé[m
     }[m
 [m
[31m-    [m
[31m-    // Création d'une facture d'achat de crédit pour un client[m
[32m+[m[32m    /**[m
[32m+[m[32m     * add a credit invoice for a client[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param string $labelTVA[m
[32m+[m[32m     * @param string $labelProduct[m
[32m+[m[32m     * @param string $description[m
[32m+[m[32m     * @param string $amountEuro[m
[32m+[m[32m     * @param string $issueDate[m
[32m+[m[32m     * @param string $dueDate[m
[32m+[m[32m     * @param int $idClient[m
[32m+[m[32m     * @param string $invoiceTitle[m
[32m+[m[32m     * @return json[m
[32m+[m[32m     * */[m
     public function createCreditsInvoiceClient(string $labelTVA, string $labelProduct, string $description, string $amountEuro, string $issueDate, string $dueDate, int $idClient, string $invoiceTitle)[m
     {[m
         $client = new \GuzzleHttp\Client();[m
[36m@@ -151,7 +204,18 @@[m [mpublic function createCreditsInvoiceClient(string $labelTVA, string $labelProduc[m
         return json_decode($response->getBody()->getContents(), true);[m
     }[m
 [m
[31m-    // Création d'une facture d'achat de crédit pour un client[m
[32m+[m[32m    /**[m
[32m+[m[32m     * add a payment invoice for a client[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param string $labelTVA[m
[32m+[m[32m     * @param string $amountEuro[m
[32m+[m[32m     * @param string $issueDate[m
[32m+[m[32m     * @param string $dueDate[m
[32m+[m[32m     * @param int $idClient[m
[32m+[m[32m     * @param string $invoiceTitle[m
[32m+[m[32m     * @param string $invoiceDescription[m
[32m+[m[32m     * @return json[m
[32m+[m[32m     * */[m
     public function createTurnoverInvoiceClient(string $labelTVA, string $amountEuro, string $issueDate, string $dueDate, int $idClient, string $invoiceTitle, string $invoiceDescription)[m
     {[m
         $client = new \GuzzleHttp\Client();[m
[36m@@ -195,6 +259,11 @@[m [mpublic function createTurnoverInvoiceClient(string $labelTVA, string $amountEuro[m
         return json_decode($response->getBody()->getContents(), true);[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * get all photographers[m
[32m+[m[32m     *[m
[32m+[m[32m     * @return array[m
[32m+[m[32m     * */[m
     public function getPhotographers()[m
     {[m
         $response = $this->client->get('customers?sort=-id');[m
[36m@@ -203,6 +272,12 @@[m [mpublic function getPhotographers()[m
         return $data['items'] ?? [];[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * get ... from a specific invoice[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param string $invoiceNumber[m
[32m+[m[32m     * @return array[m
[32m+[m[32m     * */[m
     public function getProductFromInvoice(string $invoiceNumber): ?array[m
     {[m
         $invoice = $this->getInvoiceByNumber($invoiceNumber);[m
[36m@@ -224,7 +299,7 @@[m [mpublic function getProductFromInvoice(string $invoiceNumber): ?array[m
                         'Authorization' => 'Bearer ' . $this->token,[m
                     ],[m
                 ]);[m
[31m-                [m
[32m+[m
                 $responseBody = $response->getBody()->getContents();[m
                 $data = json_decode($responseBody, true);[m
 [m
[36m@@ -242,6 +317,11 @@[m [mpublic function getProductFromInvoice(string $invoiceNumber): ?array[m
         return null; // Produit non trouvé[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * get the 100 first clients[m
[32m+[m[32m     *[m
[32m+[m[32m     * @return array[m
[32m+[m[32m     * */[m
     public function getListClients(): array[m
     {[m
         $allClients = [];[m
[36m@@ -273,6 +353,12 @@[m [mpublic function getListClients(): array[m
         return $allClients;[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * get the invoice with a specific id[m
[32m+[m[32m     *[m
[32m+[m[32m     * @param int $id[m
[32m+[m[32m     * @return array[m
[32m+[m[32m     * */[m
     public function getInvoiceById(int $id): ?array[m
     {[m
         $response = $this->client->get("customer_invoices/{$id}");[m
[36m@@ -284,5 +370,53 @@[m [mpublic function getInvoiceById(int $id): ?array[m
         return null; // Facture non trouvée[m
     }[m
 [m
[32m+[m[32m    /**[m
[32m+[m[32m     * update the credit invoices[m
[32m+[m[32m     * */[m
[32m+[m[32m    public function syncInvoices(): void[m
[32m+[m[32m    {[m
[32m+[m[32m        try {[m
[32m+[m[32m            $invoices = $this->getInvoices();[m
[32m+[m
[32m+[m[32m            foreach ($invoices as $invoice) {[m
[32m+[m
[32m+[m[32m                if (!isset($invoice['id']) or !str_contains(strtolower($invoice['label']), 'crédits')) {[m
[32m+[m[32m                    continue;[m
[32m+[m[32m                }[m
[32m+[m
[32m+[m[32m                Invoice::updateOrCreate([m
[32m+[m[32m                    [[m
[32m+[m[32m                        'external_id' => $invoice['id'],[m
[32m+[m[32m                    ],[m
[32m+[m[32m                    [[m
[32m+[m[32m                        'invoice_number' => $invoice['invoice_number'] ?? null,[m
[32m+[m[32m                        'status'         => $invoice['status'] ?? null,[m
[32m+[m[32m                        'total_amount'   => $invoice['total_amount'] ?? 0,[m
[32m+[m[32m                        'currency'       => $invoice['currency'] ?? 'EUR',[m
[32m+[m
[32m+[m[32m                        'customer_id'    => $invoice['customer']['id'] ?? null,[m
[32m+[m[32m                        'customer_name'  => $invoice['customer']['name'] ?? null,[m
[32m+[m
[32m+[m[32m                        'issued_at'      => isset($invoice['date'])[m
[32m+[m[32m                            ? Carbon::parse($invoice['date'])[m
[32m+[m[32m                            : null,[m
[32m+[m
[32m+[m[32m                        'due_at'         => isset($invoice['deadline'])[m
[32m+[m[32m                            ? Carbon::parse($invoice['deadline'])[m
[32m+[m[32m                            : null,[m
[32m+[m
[32m+[m[32m                        // trace de synchro API[m
[32m+[m[32m                        'updated_at_api' => isset($invoice['updated_at'])[m
[32m+[m[32m                            ? Carbon::parse($invoice['updated_at'])[m
[32m+[m[32m                            : now(),[m
[32m+[m[32m                    ][m
[32m+[m[32m                );[m
[32m+[m[32m            }[m
[32m+[m[32m        } catch (\Throwable $e) {[m
[32m+[m[32m            Log::error('PennyLane sync failed', [[m
[32m+[m[32m                'message' => $e->getMessage(),[m
[32m+[m[32m            ]);[m
[32m+[m[32m        }[m
[32m+[m[32m    }[m
 }[m
 [m
[1mdiff --git a/boardpxl-backend/app/Services/PhotographerService.php b/boardpxl-backend/app/Services/PhotographerService.php[m
[1mdeleted file mode 100644[m
[1mindex dc73d65..0000000[m
[1m--- a/boardpxl-backend/app/Services/PhotographerService.php[m
[1m+++ /dev/null[m
[36m@@ -1,10 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-namespace App\Services;[m
[31m-[m
[31m-use GuzzleHttp\Client;[m
[31m-[m
[31m-class PhotographerService[m
[31m-{[m
[31m-[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/config/mail.php b/boardpxl-backend/config/mail.php[m
[1mindex b5d4ac0..a631ca5 100644[m
[1m--- a/boardpxl-backend/config/mail.php[m
[1m+++ b/boardpxl-backend/config/mail.php[m
[36m@@ -13,7 +13,7 @@[m
     |[m
     */[m
 [m
[31m-    'default' => env('MAIL_MAILER', 'smtp'),[m
[32m+[m[32m    'default' => env('MAIL_MAILER', 'mailgun'),[m
 [m
     /*[m
     |--------------------------------------------------------------------------[m
[1mdiff --git a/boardpxl-backend/database/migrations/2025_11_07_151153_create_invoice_payments_table.php b/boardpxl-backend/database/migrations/2025_11_07_151153_create_invoice_payments_table.php[m
[1mindex 5c78289..94fa1a5 100644[m
[1m--- a/boardpxl-backend/database/migrations/2025_11_07_151153_create_invoice_payments_table.php[m
[1m+++ b/boardpxl-backend/database/migrations/2025_11_07_151153_create_invoice_payments_table.php[m
[36m@@ -22,8 +22,8 @@[m [mpublic function up()[m
             $table->string('description');[m
             $table->decimal('raw_value', 12, 2);[m
             $table->decimal('commission', 9, 2);[m
[31m-            $table->decimal('tax', 9, 2);[m
[31m-            $table->decimal('vat', 5, 2);[m
[32m+[m[32m            $table->decimal('tax', 5, 2);[m
[32m+[m[32m            $table->decimal('vat', 9, 2);[m
             $table->date('start_period');[m
             $table->date('end_period');[m
             $table->string('link_pdf');[m
[1mdiff --git a/boardpxl-backend/database/migrations/2025_11_14_080150_create_invoices_table.php b/boardpxl-backend/database/migrations/2025_11_14_080150_create_invoices_table.php[m
[1mindex 956a05c..179d71c 100644[m
[1m--- a/boardpxl-backend/database/migrations/2025_11_14_080150_create_invoices_table.php[m
[1m+++ b/boardpxl-backend/database/migrations/2025_11_14_080150_create_invoices_table.php[m
[36m@@ -19,8 +19,8 @@[m [mpublic function up()[m
             $table->date('issue_date');[m
             $table->date('due_date');[m
             $table->string('description');[m
[31m-            $table->decimal('tax', 9, 2);[m
[31m-            $table->decimal('vat', 5, 2);[m
[32m+[m[32m            $table->decimal('tax', 5, 2);[m
[32m+[m[32m            $table->decimal('vat', 9, 2);[m
             $table->string('link_pdf');[m
             $table->morphs('invoiceable');[m
             $table->foreignId('photographer_id')->constrained()->onDelete('cascade');[m
[1mdiff --git a/boardpxl-backend/database/migrations/2026_01_06_074316_create_mail_logs_table.php b/boardpxl-backend/database/migrations/2026_01_06_074316_create_mail_logs_table.php[m
[1mdeleted file mode 100644[m
[1mindex bba1258..0000000[m
[1m--- a/boardpxl-backend/database/migrations/2026_01_06_074316_create_mail_logs_table.php[m
[1m+++ /dev/null[m
[36m@@ -1,37 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-use Illuminate\Database\Migrations\Migration;[m
[31m-use Illuminate\Database\Schema\Blueprint;[m
[31m-use Illuminate\Support\Facades\Schema;[m
[31m-[m
[31m-class CreateMailLogsTable extends Migration[m
[31m-{[m
[31m-    /**[m
[31m-     * Run the migrations.[m
[31m-     *[m
[31m-     * @return void[m
[31m-     */[m
[31m-    public function up()[m
[31m-    {[m
[31m-        Schema::create('mail_logs', function (Blueprint $table) {[m
[31m-            $table->id();[m
[31m-            $table->foreignId('sender_id')->constrained('photographers')->onDelete('cascade');[m
[31m-            $table->string('recipient');[m
[31m-            $table->string('subject');[m
[31m-            $table->text('body')->nullable();[m
[31m-            $table->string('status');[m
[31m-            $table->string('type');[m
[31m-            $table->timestamps();[m
[31m-        });[m
[31m-    }[m
[31m-[m
[31m-    /**[m
[31m-     * Reverse the migrations.[m
[31m-     *[m
[31m-     * @return void[m
[31m-     */[m
[31m-    public function down()[m
[31m-    {[m
[31m-        Schema::dropIfExists('mail_logs');[m
[31m-    }[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/database/migrations/2026_01_06_091344_add_pennylane_fields_to_invoice_credits_table.php b/boardpxl-backend/database/migrations/2026_01_06_091344_add_pennylane_fields_to_invoice_credits_table.php[m
[1mnew file mode 100644[m
[1mindex 0000000..c6a4ef4[m
[1m--- /dev/null[m
[1m+++ b/boardpxl-backend/database/migrations/2026_01_06_091344_add_pennylane_fields_to_invoice_credits_table.php[m
[36m@@ -0,0 +1,48 @@[m
[32m+[m[32m<?php[m
[32m+[m
[32m+[m[32muse Illuminate\Database\Migrations\Migration;[m
[32m+[m[32muse Illuminate\Database\Schema\Blueprint;[m
[32m+[m[32muse Illuminate\Support\Facades\Schema;[m
[32m+[m
[32m+[m[32mclass AddPennylaneFieldsToInvoiceCreditsTable extends Migration[m
[32m+[m[32m{[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Run the migrations.[m
[32m+[m[32m     *[m
[32m+[m[32m     * @return void[m
[32m+[m[32m     */[m
[32m+[m[32m    public function up()[m
[32m+[m[32m    {[m
[32m+[m[32m        Schema::table('invoice_credits', function (Blueprint $table) {[m
[32m+[m[32m            $table->string('external_id')->unique()->after('id');[m
[32m+[m[32m            $table->timestamp('updated_at_api')->nullable()->after('status');[m
[32m+[m[32m            $table->string('pennylane_invoice_number')->nullable()->after('status');[m
[32m+[m[32m            $table->string('customer_name')->nullable()->after('photographer_id');[m
[32m+[m[32m            $table->decimal('total_amount', 9, 2)->default(0)->after('amount');[m
[32m+[m[32m            $table->string('currency')->default('EUR')->after('total_amount');[m
[32m+[m[32m            $table->timestamp('issued_at')->nullable()->after('due_date');[m
[32m+[m[32m            $table->timestamp('due_at')->nullable()->after('issued_at');[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    /**[m
[32m+[m[32m     * Reverse the migrations.[m
[32m+[m[32m     *[m
[32m+[m[32m     * @return void[m
[32m+[m[32m     */[m
[32m+[m[32m    public function down()[m
[32m+[m[32m    {[m
[32m+[m[32m        Schema::table('invoice_credits', function (Blueprint $table) {[m
[32m+[m[32m            $table->dropColumn([[m
[32m+[m[32m                'external_id',[m
[32m+[m[32m                'updated_at_api',[m
[32m+[m[32m                'pennylane_invoice_number',[m
[32m+[m[32m                'customer_name',[m
[32m+[m[32m                'total_amount',[m
[32m+[m[32m                'currency',[m
[32m+[m[32m                'issued_at',[m
[32m+[m[32m                'due_at',[m
[32m+[m[32m            ]);[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m[32m}[m
[1mdiff --git a/boardpxl-backend/database/migrations/2026_01_06_134807_create_logs_table.php b/boardpxl-backend/database/migrations/2026_01_06_134807_create_logs_table.php[m
[1mdeleted file mode 100644[m
[1mindex 37a4b7f..0000000[m
[1m--- a/boardpxl-backend/database/migrations/2026_01_06_134807_create_logs_table.php[m
[1m+++ /dev/null[m
[36m@@ -1,36 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-use Illuminate\Database\Migrations\Migration;[m
[31m-use Illuminate\Database\Schema\Blueprint;[m
[31m-use Illuminate\Support\Facades\Schema;[m
[31m-[m
[31m-class CreateLogsTable extends Migration[m
[31m-{[m
[31m-    /**[m
[31m-     * Run the migrations.[m
[31m-     *[m
[31m-     * @return void[m
[31m-     */[m
[31m-    public function up()[m
[31m-    {[m
[31m-        Schema::create('logs', function (Blueprint $table) {[m
[31m-            $table->id();[m
[31m-            $table->foreignId('action_id')->constrained('log_actions')->onDelete('cascade');[m
[31m-            $table->foreignId('user_id')->constrained('photographers')->onDelete('cascade');[m
[31m-            $table->string('table_name')->nullable();[m
[31m-            $table->ipAddress('ip_address')->nullable();[m
[31m-            $table->text('details')->nullable();[m
[31m-            $table->timestamps();[m
[31m-        });[m
[31m-    }[m
[31m-[m
[31m-    /**[m
[31m-     * Reverse the migrations.[m
[31m-     *[m
[31m-     * @return void[m
[31m-     */[m
[31m-    public function down()[m
[31m-    {[m
[31m-        Schema::dropIfExists('logs');[m
[31m-    }[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/database/migrations/2026_01_06_143017_create_log_actions_table.php b/boardpxl-backend/database/migrations/2026_01_06_143017_create_log_actions_table.php[m
[1mdeleted file mode 100644[m
[1mindex aaa8b7f..0000000[m
[1m--- a/boardpxl-backend/database/migrations/2026_01_06_143017_create_log_actions_table.php[m
[1m+++ /dev/null[m
[36m@@ -1,33 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-use Illuminate\Database\Migrations\Migration;[m
[31m-use Illuminate\Database\Schema\Blueprint;[m
[31m-use Illuminate\Support\Facades\Schema;[m
[31m-[m
[31m-class CreateLogActionsTable extends Migration[m
[31m-{[m
[31m-    /**[m
[31m-     * Run the migrations.[m
[31m-     *[m
[31m-     * @return void[m
[31m-     */[m
[31m-    public function up()[m
[31m-    {[m
[31m-        Schema::create('log_actions', function (Blueprint $table) {[m
[31m-            $table->id();[m
[31m-            $table->string('action');[m
[31m-            $table->string('permission')->nullable();[m
[31m-            $table->timestamps();[m
[31m-        });[m
[31m-    }[m
[31m-[m
[31m-    /**[m
[31m-     * Reverse the migrations.[m
[31m-     *[m
[31m-     * @return void[m
[31m-     */[m
[31m-    public function down()[m
[31m-    {[m
[31m-        Schema::dropIfExists('log_actions');[m
[31m-    }[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/database/seeders/LogActionsSeeder.php b/boardpxl-backend/database/seeders/LogActionsSeeder.php[m
[1mdeleted file mode 100644[m
[1mindex 4287256..0000000[m
[1m--- a/boardpxl-backend/database/seeders/LogActionsSeeder.php[m
[1m+++ /dev/null[m
[36m@@ -1,85 +0,0 @@[m
[31m-<?php[m
[31m-[m
[31m-namespace Database\Seeders;[m
[31m-[m
[31m-use Illuminate\Database\Seeder;[m
[31m-[m
[31m-class LogActionsSeeder extends Seeder[m
[31m-{[m
[31m-    /**[m
[31m-     * Run the database seeds.[m
[31m-     *[m
[31m-     * @return void[m
[31m-     */[m
[31m-    public function run()[m
[31m-    {[m
[31m-        $actions = [[m
[31m-            // Invoice Credits Actions[m
[31m-            ['action' => 'create_credits_invoice_client', 'permission' => 'admin'],[m
[31m-            ['action' => 'create_credits_invoice_client_failed', 'permission' => 'admin'],[m
[31m-            ['action' => 'insert_credits_invoice', 'permission' => 'admin'],[m
[31m-            ['action' => 'insert_credits_invoice_failed', 'permission' => 'admin'],[m
[31m-            ['action' => 'get_invoices_credit_by_photographer', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_invoices_credit_by_photographer_failed', 'permission' => 'photographer'],[m
[31m-            [m
[31m-            // Invoice Payments Actions[m
[31m-            ['action' => 'create_turnover_payment_invoice', 'permission' => 'admin'],[m
[31m-            ['action' => 'create_turnover_payment_invoice_failed', 'permission' => 'admin'],[m
[31m-            ['action' => 'insert_turnover_invoice', 'permission' => 'admin'],[m
[31m-            ['action' => 'insert_turnover_invoice_failed', 'permission' => 'admin'],[m
[31m-            ['action' => 'get_invoices_payment_by_photographer', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_invoices_payment_by_photographer_failed', 'permission' => 'photographer'],[m
[31m-            [m
[31m-            // General Invoice Actions[m
[31m-            ['action' => 'list_invoices', 'permission' => 'photographer'],[m
[31m-            ['action' => 'list_invoices_by_client', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_invoice_by_id', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_invoice_by_id_not_found', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_product_from_invoice', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_product_from_invoice_not_found', 'permission' => 'photographer'],[m
[31m-            ['action' => 'download_invoice_proxy', 'permission' => 'photographer'],[m
[31m-            ['action' => 'download_invoice_proxy_missing_url', 'permission' => 'photographer'],[m
[31m-            [m
[31m-            // Photographer/Client Actions[m
[31m-            ['action' => 'lookup_client_id', 'permission' => 'photographer'],[m
[31m-            ['action' => 'lookup_client_id_not_found', 'permission' => 'photographer'],[m
[31m-            ['action' => 'list_photographers', 'permission' => 'admin'],[m
[31m-            ['action' => 'list_clients', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_photographers', 'permission' => 'admin'],[m
[31m-            ['action' => 'create_photographer', 'permission' => 'admin'],[m
[31m-            ['action' => 'create_photographer_failed', 'permission' => 'admin'],[m
[31m-            ['action' => 'update_photographer', 'permission' => 'admin'],[m
[31m-            ['action' => 'update_photographer_failed', 'permission' => 'admin'],[m
[31m-            ['action' => 'delete_photographer', 'permission' => 'admin'],[m
[31m-            ['action' => 'delete_photographer_failed', 'permission' => 'admin'],[m
[31m-            [m
[31m-            // Mail Actions[m
[31m-            ['action' => 'send_email', 'permission' => 'photographer'],[m
[31m-            ['action' => 'send_email_failed', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_mail_logs', 'permission' => 'photographer'],[m
[31m-            ['action' => 'get_mail_logs_failed', 'permission' => 'photographer'],[m
[31m-            [m
[31m-            // Authentication Actions[m
[31m-            ['action' => 'login', 'permission' => 'guest'],[m
[31m-            ['action' => 'login_failed', 'permission' => 'guest'],[m
[31m-            ['action' => 'logout', 'permission' => 'photographer'],[m
[31m-            ['action' => 'register', 'permission' => 'guest'],[m
[31m-            ['action' => 'register_failed', 'permission' => 'guest'],[m
[31m-            ['action' => 'password_reset_request', 'permission' => 'guest'],[m
[31m-            ['action' => 'password_reset_complete', 'permission' => 'guest'],[m
[31m-            [m
[31m-            // Data Export/Import Actions[m
[31m-            ['action' => 'export_invoices', 'permission' => 'photographer'],[m
[31m-            ['action' => 'export_invoices_failed', 'permission' => 'photographer'],[m
[31m-            ['action' => 'import_data', 'permission' => 'admin'],[m
[31m-            ['action' => 'import_data_failed', 'permission' => 'admin'],[m
[31m-        ];[m
[31m-[m
[31m-        foreach ($actions as $action) {[m
[31m-            \App\Models\LogActions::updateOrCreate([m
[31m-                ['action' => $action['action']],[m
[31m-                ['permission' => $action['permission']][m
[31m-            );[m
[31m-        }[m
[31m-    }[m
[31m-}[m
[1mdiff --git a/boardpxl-backend/routes/api.php b/boardpxl-backend/routes/api.php[m
[1mindex f566738..64fdd0e 100644[m
[1m--- a/boardpxl-backend/routes/api.php[m
[1m+++ b/boardpxl-backend/routes/api.php[m
[36m@@ -1,6 +1,5 @@[m
 <?php[m
 [m
[31m-use App\Http\Controllers\PhotographerController;[m
 use App\Http\Controllers\InvoiceController;[m
 use App\Services\PennyLaneService;[m
 use App\Services\MailService;[m
[36m@@ -11,6 +10,7 @@[m
 use App\Http\Controllers\MailController;[m
 use App\Models\Photographer;[m
 use Illuminate\Support\Facades\Mail;[m
[32m+[m[32muse App\Http\Controllers\PhotographerController;[m
 [m
 use App\Http\Controllers\Auth\LoginController;[m
 use App\Http\Controllers\Auth\RegisterController;[m
[36m@@ -19,8 +19,6 @@[m
 use App\Http\Controllers\Auth\VerificationController;[m
 use App\Http\Controllers\Auth\ConfirmPasswordController;[m
 [m
[31m-use App\Http\Controllers\LogsController;[m
[31m-[m
 /*[m
 |--------------------------------------------------------------------------[m
 | Routes publiques (sans authentification)[m
[36m@@ -36,11 +34,12 @@[m
 Route::get('/email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify');[m
 Route::get('/email/resend', [VerificationController::class, 'resend'])->name('verification.resend');[m
 [m
[31m-// Tester récupération globale[m
[31m-Route::get('/test', [PennylaneController::class, 'getInvoices']);[m
 [m
[31m-// Récupérer l'ID d’un client[m
[31m-Route::post('/client-id', [PennylaneController::class, 'getClientId']);[m
[32m+[m[32m// Insertion d'une facture de versement de CA[m
[32m+[m[32mRoute::post('/insert-turnover-invoice', [InvoiceController::class, 'insertTurnoverInvoice']);[m
[32m+[m
[32m+[m[32m// Insertion d'une facture de crédits[m
[32m+[m[32mRoute::post('/insert-credits-invoice', [InvoiceController::class, 'insertCreditsInvoice']);[m
 [m
 /*[m
 |--------------------------------------------------------------------------[m
[36m@@ -48,69 +47,63 @@[m
 |--------------------------------------------------------------------------[m
 */[m
 [m
[31m-Route::middleware('auth:sanctum')->group(function () {[m
[32m+[m[32mRoute::middleware(['auth:sanctum', 'sync.pennylane'])->group(function () {[m
 [m
[31m-// Utilisateur connecté[m
[31m-Route::get('/user', function (Request $request) {[m
[31m-    return $request->user();[m
[31m-});[m
[32m+[m[32m    // Tester récupération globale[m
[32m+[m[32m    Route::get('/test', [PennylaneController::class, 'getInvoices']);[m
 [m
[31m-// Déconnexion[m
[31m-Route::post('/logout', [LoginController::class, 'logout']);[m
[31m-  [m
[31m-  [m
[31m-// Récupérer les factures de versement d’un photographe[m
[31m-Route::get('/invoices-payment/{photographer_id}', [InvoiceController::class, 'getInvoicesPaymentByPhotographer']);[m
[32m+[m[32m    // Récupérer l'ID d’un client[m
[32m+[m[32m    Route::post('/client-id', [PennylaneController::class, 'getClientId']);[m
 [m
[31m-// Récupérer les factures de crédit d’un photographe[m
[31m-Route::get('/invoices-credit/{photographer_id}', [InvoiceController::class, 'getInvoicesCreditByPhotographer']);[m
[32m+[m[32m    // Création d'une facture[m
[32m+[m[32m    Route::post('/create-credits-invoice-client', [PennylaneController::class, 'createCreditsInvoiceClient']);[m
 [m
[31m-// Création d'une facture[m
[31m-Route::post('/create-credits-invoice-client', [PennylaneController::class, 'createCreditsInvoiceClient']);[m
[32m+[m[32m    // Création d'une facture de versement de CA[m
[32m+[m[32m    Route::post('/create-turnover-invoice-client', [PennylaneController::class, 'createTurnoverPaymentInvoice']);[m
 [m
[31m-// Création d'une facture de versement de CA[m
[31m-Route::post('/create-turnover-invoice-client', [PennylaneController::class, 'createTurnoverPaymentInvoice']);[m
[32m+[m[32m    //////[m
 [m
[31m-// Insertion d'une facture de versement de CA[m
[31m-Route::post('/insert-turnover-invoice', [InvoiceController::class, 'insertTurnoverInvoice']);[m
[32m+[m[32m    // Utilisateur connecté[m
[32m+[m[32m    Route::get('/user', function (Request $request) {[m
[32m+[m[32m        return $request->user();[m
[32m+[m[32m    });[m
 [m
[31m-// Insertion d'une facture de crédits[m
[31m-Route::post('/insert-credits-invoice', [InvoiceController::class, 'insertCreditsInvoice']);[m
[32m+[m[32m    // Déconnexion[m
[32m+[m[32m    Route::post('/logout', [LoginController::class, 'logout']);[m
 [m
 [m
[31m-// Récupérer la liste des clients[m
[31m-Route::get('/list-clients', [PennylaneController::class, 'getListClients']);[m
[32m+[m[32m    // Récupérer les factures de versement d’un photographe[m
[32m+[m[32m    Route::get('/invoices-payment/{photographer_id}', [InvoiceController::class, 'getInvoicesPaymentByPhotographer']);[m
 [m
[31m-// Téléchargement contournement CORS[m
[31m-Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);[m
[32m+[m[32m    // Récupérer les factures de crédit d’un photographe[m
[32m+[m[32m    Route::get('/invoices-credit/{photographer_id}', [InvoiceController::class, 'getInvoicesCreditByPhotographer']);[m
[32m+[m[32m    // Récupérer la liste des clients[m
[32m+[m[32m    Route::get('/list-clients', [PennylaneController::class, 'getListClients']);[m
 [m
[31m-// Afficher une facture spécifique[m
[31m-Route::get('/invoices/{id}', [PennylaneController::class, 'getInvoiceById']);[m
[32m+[m[32m    // Téléchargement contournement CORS[m
[32m+[m[32m    Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);[m
 [m
[32m+[m[32m    // Afficher une facture spécifique[m
[32m+[m[32m    Route::get('/invoices/{id}', [PennylaneController::class, 'getInvoiceById']);[m
 [m
 [m
[31m-// Confirmation de mot de passe[m
[31m-Route::post('/password/confirm', [ConfirmPasswordController::class, 'confirm']);[m
 [m
[31m-// Routes PennyLane (factures)[m
[31m-Route::post('/creation-facture', [PennylaneController::class, 'createInvoice']);[m
[31m-Route::get('/test', [PennylaneController::class, 'getInvoices']);[m
[31m-Route::get('/client-id', [PennylaneController::class, 'getClientId']);[m
[31m-Route::get('/invoices-client/{idClient}', [PennylaneController::class, 'getInvoicesByClient']);[m
[31m-Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);[m
[31m-Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);[m
[32m+[m[32m    // Confirmation de mot de passe[m
[32m+[m[32m    Route::post('/password/confirm', [ConfirmPasswordController::class, 'confirm']);[m
 [m
[31m-// Routes Mail[m
[31m-Route::post('/send-email', [MailController::class, 'sendEmail']);[m
[31m-Route::get('/test-mail', [MailController::class, 'testMail']);[m
[31m-Route::get('/mail-logs/{sender_id}', [MailController::class, 'getLogs']);[m
[32m+[m[32m    // Routes PennyLane (factures)[m
[32m+[m[32m    Route::post('/creation-facture', [PennylaneController::class, 'createInvoice']);[m
[32m+[m[32m    Route::get('/test', [PennylaneController::class, 'getInvoices']);[m
[32m+[m[32m    Route::get('/client-id', [PennylaneController::class, 'getClientId']);[m
[32m+[m[32m    Route::get('/invoices-client/{idClient}', [PennylaneController::class, 'getInvoicesByClient']);[m
[32m+[m[32m    Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);[m
[32m+[m[32m    Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);[m
 [m
[31m-// Récupérer tous les clients[m
[31m-Route::get('/photographers', [PhotographerController::class, 'getPhotographers']);[m
[32m+[m[32m    // Routes Mail[m
[32m+[m[32m    Route::post('/send-email', [MailController::class, 'sendEmail']);[m
[32m+[m[32m    Route::get('/test-mail', [MailController::class, 'testMail']);[m
 [m
[31m-//un client[m
[31m-Route::get('photographer/{id}', [PhotographerController::class, 'getPhotographer']);[m
[32m+[m[32m    // Récupérer tous les clients[m
[32m+[m[32m    Route::get('/photographers', [PhotographerController::class, 'getPhotographers']);[m
 [m
[31m-// Logs[m
[31m-Route::get('/logs', [LogsController::class, 'getLogs']);[m
 });[m
[1mdiff --git a/boardpxl-frontend/public/assets/images/histofacture_icon.svg b/boardpxl-frontend/public/assets/images/histofacture_icon.svg[m
[1mdeleted file mode 100644[m
[1mindex 88789d2..0000000[m
[1m--- a/boardpxl-frontend/public/assets/images/histofacture_icon.svg[m
[1m+++ /dev/null[m
[36m@@ -1,8 +0,0 @@[m
[31m-<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">[m
[31m-<mask id="mask0_617_203" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">[m
[31m-<rect width="24" height="24" fill="#D9D9D9"/>[m
[31m-</mask>[m
[31m-<g mask="url(#mask0_617_203)">[m
[31m-<path d="M6 22C5.16667 22 4.45833 21.7083 3.875 21.125C3.29167 20.5417 3 19.8333 3 19V16H6V2L7.5 3.5L9 2L10.5 3.5L12 2L13.5 3.5L15 2L16.5 3.5L18 2L19.5 3.5L21 2V19C21 19.8333 20.7083 20.5417 20.125 21.125C19.5417 21.7083 18.8333 22 18 22H6ZM18 20C18.2833 20 18.5208 19.9042 18.7125 19.7125C18.9042 19.5208 19 19.2833 19 19V5H8V16H17V19C17 19.2833 17.0958 19.5208 17.2875 19.7125C17.4792 19.9042 17.7167 20 18 20ZM9 9V7H15V9H9ZM9 12V10H15V12H9ZM17 9C16.7167 9 16.4792 8.90417 16.2875 8.7125C16.0958 8.52083 16 8.28333 16 8C16 7.71667 16.0958 7.47917 16.2875 7.2875C16.4792 7.09583 16.7167 7 17 7C17.2833 7 17.5208 7.09583 17.7125 7.2875C17.9042 7.47917 18 7.71667 18 8C18 8.28333 17.9042 8.52083 17.7125 8.7125C17.5208 8.90417 17.2833 9 17 9ZM17 12C16.7167 12 16.4792 11.9042 16.2875 11.7125C16.0958 11.5208 16 11.2833 16 11C16 10.7167 16.0958 10.4792 16.2875 10.2875C16.4792 10.0958 16.7167 10 17 10C17.2833 10 17.5208 10.0958 17.7125 10.2875C17.9042 10.4792 18 10.7167 18 11C18 11.2833 17.9042 11.5208 17.7125 11.7125C17.5208 11.9042 17.2833 12 17 12ZM6 20H15V18H5V19C5 19.2833 5.09583 19.5208 5.2875 19.7125C5.47917 19.9042 5.71667 20 6 20Z" fill="#1C1B1F"/>[m
[31m-</g>[m
[31m-</svg>[m
[1mdiff --git a/boardpxl-frontend/public/assets/images/logs_icon.svg b/boardpxl-frontend/public/assets/images/logs_icon.svg[m
[1mdeleted file mode 100644[m
[1mindex 212d14f..0000000[m
[1m--- a/boardpxl-frontend/public/assets/images/logs_icon.svg[m
[1m+++ /dev/null[m
[36m@@ -1 +0,0 @@[m
[31m-<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-320h320v-80H240v80Zm0-160h480v-80H240v80Zm-80 320q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z"/></svg>[m
\ No newline at end of file[m
[1mdiff --git a/boardpxl-frontend/public/assets/images/mail_icon.svg b/boardpxl-frontend/public/assets/images/mail_icon.svg[m
[1mdeleted file mode 100644[m
[1mindex b2e2682..0000000[m
[1m--- a/boardpxl-frontend/public/assets/images/mail_icon.svg[m
[1m+++ /dev/null[m
[36m@@ -1 +0,0 @@[m
[31m-<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>[m
\ No newline at end of file[m
[1mdiff --git a/boardpxl-frontend/public/assets/images/photographer_icon.svg b/boardpxl-frontend/public/assets/images/photographer_icon.svg[m
[1mdeleted file mode 100644[m
[1mindex 4c9fcfb..0000000[m
[1m--- a/boardpxl-frontend/public/assets/images/photographer_icon.svg[m
[1m+++ /dev/null[m
[36m@@ -1,8 +0,0 @@[m
[31m-<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">[m
[31m-<mask id="mask0_385_395" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">[m
[31m-<rect width="24" height="24" fill="#D9D9D9"/>[m
[31m-</mask>[m
[31m-<g mask="url(#mask0_385_395)">[m
[31m-<path d="M5.85 17.1C6.7 16.45 7.65 15.9375 8.7 15.5625C9.75 15.1875 10.85 15 12 15C13.15 15 14.25 15.1875 15.3 15.5625C16.35 15.9375 17.3 16.45 18.15 17.1C18.7333 16.4167 19.1875 15.6417 19.5125 14.775C19.8375 13.9083 20 12.9833 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 12.9833 4.1625 13.9083 4.4875 14.775C4.8125 15.6417 5.26667 16.4167 5.85 17.1ZM12 13C11.0167 13 10.1875 12.6625 9.5125 11.9875C8.8375 11.3125 8.5 10.4833 8.5 9.5C8.5 8.51667 8.8375 7.6875 9.5125 7.0125C10.1875 6.3375 11.0167 6 12 6C12.9833 6 13.8125 6.3375 14.4875 7.0125C15.1625 7.6875 15.5 8.51667 15.5 9.5C15.5 10.4833 15.1625 11.3125 14.4875 11.9875C13.8125 12.6625 12.9833 13 12 13ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C12.8833 20 13.7167 19.8708 14.5 19.6125C15.2833 19.3542 16 18.9833 16.65 18.5C16 18.0167 15.2833 17.6458 14.5 17.3875C13.7167 17.1292 12.8833 17 12 17C11.1167 17 10.2833 17.1292 9.5 17.3875C8.71667 17.6458 8 18.0167 7.35 18.5C8 18.9833 8.71667 19.3542 9.5 19.6125C10.2833 19.8708 11.1167 20 12 20ZM12 11C12.4333 11 12.7917 10.8583 13.075 10.575C13.3583 10.2917 13.5 9.93333 13.5 9.5C13.5 9.06667 13.3583 8.70833 13.075 8.425C12.7917 8.14167 12.4333 8 12 8C11.5667 8 11.2083 8.14167 10.925 8.425C10.6417 8.70833 10.5 9.06667 10.5 9.5C10.5 9.93333 10.6417 10.2917 10.925 10.575C11.2083 10.8583 11.5667 11 12 11Z" fill="#1C1B1F"/>[m
[31m-</g>[m
[31m-</svg>[m
[1mdiff --git a/boardpxl-frontend/public/assets/images/profile_info_icon.svg b/boardpxl-frontend/public/assets/images/profile_info_icon.svg[m
[1mdeleted file mode 100644[m
[1mindex d4cfa75..0000000[m
[1m--- a/boardpxl-frontend/public/assets/images/profile_info_icon.svg[m
[1m+++ /dev/null[m
[36m@@ -1 +0,0 @@[m
[31m-<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M560-440h200v-80H560v80Zm0-120h200v-80H560v80ZM200-320h320v-22q0-45-44-71.5T360-440q-72 0-116 26.5T200-342v22Zm160-160q33 0 56.5-23.5T440-560q0-33-23.5-56.5T360-640q-33 0-56.5 23.5T280-560q0 33 23.5 56.5T360-480ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/></svg>[m
\ No newline at end of file[m
[1mdiff --git a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.html b/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.html[m
[1mdeleted file mode 100644[m
[1mindex 46086a9..0000000[m
[1m--- a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.html[m
[1m+++ /dev/null[m
[36m@@ -1,5 +0,0 @@[m
[31m-<app-title [title]="photographerName ? 'FACTURES DE ' + photographerName.toUpperCase() : 'FACTURES DU PHOTOGRAPHE'" [icon]="'assets/images/logo-tableau-de-bord.png'"></app-title>[m
[31m-<main>[m
[31m-    <app-invoice-history *ngIf="pennylaneId" [user]="pennylaneId"></app-invoice-history>[m
[31m-    <p *ngIf="!pennylaneId" style="text-align: center; padding: 20px; color: #666;">Chargement...</p>[m
[31m-</main>[m
\ No newline at end of file[m
[1mdiff --git a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.scss b/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.scss[m
[1mdeleted file mode 100644[m
[1mindex 707d6bb..0000000[m
[1m--- a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.scss[m
[1m+++ /dev/null[m
[36m@@ -1,3 +0,0 @@[m
[31m-main {[m
[31m-    margin: 13px;[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.spec.ts b/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.spec.ts[m
[1mdeleted file mode 100644[m
[1mindex 93e9659..0000000[m
[1m--- a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.spec.ts[m
[1m+++ /dev/null[m
[36m@@ -1,23 +0,0 @@[m
[31m-import { ComponentFixture, TestBed } from '@angular/core/testing';[m
[31m-[m
[31m-import { AdminPhotographerInvoiceList } from './admin-photographer-invoice-list';[m
[31m-[m
[31m-describe('AdminPhotographerInvoiceList', () => {[m
[31m-  let component: AdminPhotographerInvoiceList;[m
[31m-  let fixture: ComponentFixture<AdminPhotographerInvoiceList>;[m
[31m-[m
[31m-  beforeEach(async () => {[m
[31m-    await TestBed.configureTestingModule({[m
[31m-      declarations: [AdminPhotographerInvoiceList][m
[31m-    })[m
[31m-    .compileComponents();[m
[31m-[m
[31m-    fixture = TestBed.createComponent(AdminPhotographerInvoiceList);[m
[31m-    component = fixture.componentInstance;[m
[31m-    fixture.detectChanges();[m
[31m-  });[m
[31m-[m
[31m-  it('should create', () => {[m
[31m-    expect(component).toBeTruthy();[m
[31m-  });[m
[31m-});[m
[1mdiff --git a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.ts b/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.ts[m
[1mdeleted file mode 100644[m
[1mindex ed8c2f0..0000000[m
[1m--- a/boardpxl-frontend/src/app/admin-photographer-invoice-list/admin-photographer-invoice-list.ts[m
[1m+++ /dev/null[m
[36m@@ -1,60 +0,0 @@[m
[31m-import { Component, OnInit, OnDestroy } from '@angular/core';[m
[31m-import { ActivatedRoute, Router } from '@angular/router';[m
[31m-import { Subject } from 'rxjs';[m
[31m-import { takeUntil } from 'rxjs/operators';[m
[31m-import { PhotographerService } from '../services/photographer-service';[m
[31m-[m
[31m-@Component({[m
[31m-  selector: 'app-admin-photographer-invoice-list',[m
[31m-  standalone: false,[m
[31m-  templateUrl: './admin-photographer-invoice-list.html',[m
[31m-  styleUrl: './admin-photographer-invoice-list.scss',[m
[31m-})[m
[31m-export class AdminPhotographerInvoiceList implements OnInit, OnDestroy {[m
[31m-  photographerId: string = '';[m
[31m-  photographerName: string = '';[m
[31m-  pennylaneId: string = '';[m
[31m-  private destroy$ = new Subject<void>();[m
[31m-[m
[31m-  constructor([m
[31m-    private route: ActivatedRoute,[m
[31m-    private router: Router,[m
[31m-    private photographerService: PhotographerService[m
[31m-  ) {}[m
[31m-[m
[31m-  ngOnInit() {[m
[31m-    // Récupérer l'ID depuis l'URL[m
[31m-    this.photographerId = this.route.snapshot.paramMap.get('id') || '';[m
[31m-    [m
[31m-    // Récupérer le nom depuis les queryParams (optionnel)[m
[31m-    this.photographerName = this.route.snapshot.queryParamMap.get('name') || '';[m
[31m-    [m
[31m-    // Si pas d'ID, rediriger[m
[31m-    if (!this.photographerId) {[m
[31m-      this.router.navigate(['/photographers']);[m
[31m-      return;[m
[31m-    }[m
[31m-[m
[31m-    // Récupérer le photographe pour obtenir son pennylane_id[m
[31m-    this.photographerService.getPhotographers()[m
[31m-      .pipe(takeUntil(this.destroy$))[m
[31m-      .subscribe(photographers => {[m
[31m-        const photographer = photographers.find(p => p.id.toString() === this.photographerId);[m
[31m-        if (photographer) {[m
[31m-          this.pennylaneId = photographer.pennylane_id;[m
[31m-          if (!this.photographerName) {[m
[31m-            this.photographerName = photographer.name;[m
[31m-          }[m
[31m-        }[m
[31m-      });[m
[31m-  }[m
[31m-[m
[31m-  ngOnDestroy() {[m
[31m-    this.destroy$.next();[m
[31m-    this.destroy$.complete();[m
[31m-  }[m
[31m-[m
[31m-  goBack() {[m
[31m-    this.router.navigate(['/photographers']);[m
[31m-  }[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/app-module.ts b/boardpxl-frontend/src/app/app-module.ts[m
[1mindex 552d0d0..ac3519c 100644[m
[1m--- a/boardpxl-frontend/src/app/app-module.ts[m
[1m+++ b/boardpxl-frontend/src/app/app-module.ts[m
[36m@@ -28,12 +28,8 @@[m [mimport { PhotographerCard } from './photographer-card/photographer-card';[m
 import { SearchBar } from './search-bar/search-bar';[m
 import { Pagination } from './pagination/pagination';[m
 import { CreditPurchaseForm } from './credit-purchase-form/credit-purchase-form';[m
[31m-import {ProfileInformation} from './profile-information/profile-information';[m
 import { Popup } from './popup/popup';[m
 import { TurnoverPaymentForm } from './turnover-payment-form/turnover-payment-form';[m
[31m-import { MailsLog } from './mails-log/mails-log';[m
[31m-import { AdminPhotographerInvoiceList } from './admin-photographer-invoice-list/admin-photographer-invoice-list';[m
[31m-import { Logs } from './logs/logs';[m
 registerLocaleData(localeFr);[m
 [m
 @NgModule({[m
[36m@@ -48,8 +44,6 @@[m [mregisterLocaleData(localeFr);[m
     PhotographerRequest,[m
     AutomaticResponse,[m
     MailRequestPage,[m
[31m-    CreditPurchaseForm,[m
[31m-    ProfileInformation,[m
     InvoiceFilter,[m
     LoginPage,[m
     NavigationBar,[m
[36m@@ -59,10 +53,7 @@[m [mregisterLocaleData(localeFr);[m
     Pagination,[m
     CreditPurchaseForm,[m
     Popup,[m
[31m-    TurnoverPaymentForm,[m
[31m-    MailsLog,[m
[31m-    AdminPhotographerInvoiceList,[m
[31m-    Logs[m
[32m+[m[32m    TurnoverPaymentForm[m
   ],[m
   imports: [[m
     BrowserModule,[m
[1mdiff --git a/boardpxl-frontend/src/app/app-routing-module.ts b/boardpxl-frontend/src/app/app-routing-module.ts[m
[1mindex d7a0ff2..c3b2f74 100644[m
[1m--- a/boardpxl-frontend/src/app/app-routing-module.ts[m
[1m+++ b/boardpxl-frontend/src/app/app-routing-module.ts[m
[36m@@ -8,26 +8,18 @@[m [mimport { photographerGuard } from './guards/photographer.guard';[m
 import { adminGuard } from './guards/admin.guard';[m
 import { PhotographersList } from './photographers-list/photographers-list';[m
 import { CreditPurchaseForm } from './credit-purchase-form/credit-purchase-form';[m
[31m-import {ProfileInformation} from './profile-information/profile-information';[m
 import { TurnoverPaymentForm } from './turnover-payment-form/turnover-payment-form';[m
[31m-import { MailsLog } from './mails-log/mails-log';[m
[31m-import { AdminPhotographerInvoiceList } from './admin-photographer-invoice-list/admin-photographer-invoice-list';[m
[31m-import { Logs } from './logs/logs';[m
 [m
 const routes: Routes = [[m
   { path: 'login', component: LoginPage },[m
   { path: '', component: PhotographerDashboard, pathMatch: 'full', canActivate: [photographerGuard] },[m
   { path: 'photographers', component: PhotographersList, canActivate: [adminGuard] },[m
[31m-  { path: 'photographer/:id/invoices', component: AdminPhotographerInvoiceList, canActivate: [adminGuard] },[m
   { path: 'request/payout', component: MailRequestPage, canActivate: [photographerGuard] },[m
   { path: 'request/credits', component: MailRequestPage, canActivate: [photographerGuard]},[m
   { path: 'request/success', component: AutomaticResponse, canActivate: [photographerGuard]},[m
   { path: 'request/failure', component: AutomaticResponse, canActivate: [photographerGuard]},[m
[31m-  { path: 'mails', component: MailsLog, canActivate: [photographerGuard]},[m
   { path: 'form/credits', component: CreditPurchaseForm, canActivate: [adminGuard]},[m
   { path: 'form/payout', component: TurnoverPaymentForm, canActivate: [adminGuard]},[m
[31m-  { path: 'logs', component: Logs, canActivate: [adminGuard]},[m
[31m-  { path: 'photographer/:id', component: ProfileInformation, canActivate: [adminGuard]},[m
   { path: '**', redirectTo: '' },[m
 ];[m
 [m
[1mdiff --git a/boardpxl-frontend/src/app/app.ts b/boardpxl-frontend/src/app/app.ts[m
[1mindex bb97e53..f89a619 100644[m
[1m--- a/boardpxl-frontend/src/app/app.ts[m
[1m+++ b/boardpxl-frontend/src/app/app.ts[m
[36m@@ -6,7 +6,6 @@[m [mimport { Component, signal } from '@angular/core';[m
   standalone: false,[m
   styleUrl: './app.scss'[m
 })[m
[31m-[m
 export class App {[m
   protected readonly title = signal('boardpxl-frontend');[m
 }[m
[1mdiff --git a/boardpxl-frontend/src/app/header/header.html b/boardpxl-frontend/src/app/header/header.html[m
[1mindex b219e0e..e5613c8 100644[m
[1m--- a/boardpxl-frontend/src/app/header/header.html[m
[1m+++ b/boardpxl-frontend/src/app/header/header.html[m
[36m@@ -12,4 +12,4 @@[m
    </div>[m
    <p>{{userName}}</p>[m
 </nav>[m
[31m-</header>[m
[32m+[m[32m</header>[m
\ No newline at end of file[m
[1mdiff --git a/boardpxl-frontend/src/app/header/header.scss b/boardpxl-frontend/src/app/header/header.scss[m
[1mindex c7adc1d..3623c34 100644[m
[1m--- a/boardpxl-frontend/src/app/header/header.scss[m
[1m+++ b/boardpxl-frontend/src/app/header/header.scss[m
[36m@@ -1,10 +1,3 @@[m
[31m-header{[m
[31m-  position: sticky;[m
[31m-  top: 0;[m
[31m-  width: 100%;[m
[31m-  z-index: 10;[m
[31m-}[m
[31m-[m
 nav > div {[m
   display: flex;[m
   align-items: center;[m
[1mdiff --git a/boardpxl-frontend/src/app/logs/logs.html b/boardpxl-frontend/src/app/logs/logs.html[m
[1mdeleted file mode 100644[m
[1mindex 6635f7b..0000000[m
[1m--- a/boardpxl-frontend/src/app/logs/logs.html[m
[1m+++ /dev/null[m
[36m@@ -1,80 +0,0 @@[m
[31m-<app-title [title]="'Historique des actions'" [icon]="'assets/images/logo-tableau-de-bord.png'"></app-title>[m
[31m-[m
[31m-<div class="logs-shell">[m
[31m-  <div class="hero">[m
[31m-    <div class="stats">[m
[31m-      <div class="stat-card">[m
[31m-        <p class="label">Logs filtrés</p>[m
[31m-        <p class="value">{{ filteredLogs.length }}</p>[m
[31m-      </div>[m
[31m-      <div class="stat-card">[m
[31m-        <p class="label">Actions uniques</p>[m
[31m-        <p class="value">{{ uniqueActions.length }}</p>[m
[31m-      </div>[m
[31m-    </div>[m
[31m-  </div>[m
[31m-[m
[31m-  <div class="filters">[m
[31m-    <div class="input-group search">[m
[31m-      <input type="text" placeholder="Rechercher (action, table, IP)" [(ngModel)]="searchTerm" (input)="filterLogs()">[m
[31m-    </div>[m
[31m-    <div class="input-group">[m
[31m-      <select [(ngModel)]="selectedAction" (change)="filterLogs()">[m
[31m-        <option value="">Toutes les actions</option>[m
[31m-        <option *ngFor="let action of uniqueActions" [value]="action">{{ action }}</option>[m
[31m-      </select>[m
[31m-    </div>[m
[31m-    <div class="date-range">[m
[31m-      <input type="date" [(ngModel)]="startDate" (change)="filterLogs()">[m
[31m-      <span class="dash">—</span>[m
[31m-      <input type="date" [(ngModel)]="endDate" (change)="filterLogs()">[m
[31m-    </div>[m
[31m-  </div>[m
[31m-[m
[31m-  <div class="logs-list">[m
[31m-    <div class="loading-overlay" *ngIf="isLoading">[m
[31m-      <div class="spinner"></div>[m
[31m-      <p>Chargement des logs...</p>[m
[31m-    </div>[m
[31m-[m
[31m-    <div class="empty-state" *ngIf="!isLoading && filteredLogs.length === 0">[m
[31m-      <p>Aucun log trouvé</p>[m
[31m-    </div>[m
[31m-[m
[31m-    <div class="log-card" *ngFor="let log of pagedLogs">[m
[31m-      <div class="log-header">[m
[31m-        <div class="left">[m
[31m-          <span class="pill">{{ log.table_name || 'N/A' }}</span>[m
[31m-          <span class="log-action">{{ log.action }}</span>[m
[31m-        </div>[m
[31m-        <span class="log-date">{{ log.created_at | date: 'dd/MM/yyyy HH:mm' }}</span>[m
[31m-      </div>[m
[31m-[m
[31m-      <div class="log-meta">[m
[31m-        <div>[m
[31m-          <span class="label">Utilisateur</span>[m
[31m-          <span class="value">{{ log.photographer_name || log.user_id }}</span>[m
[31m-        </div>[m
[31m-        <div>[m
[31m-          <span class="label">IP</span>[m
[31m-          <span class="value">{{ log.ip_address }}</span>[m
[31m-        </div>[m
[31m-        <div>[m
[31m-          <span class="label">ID Log</span>[m
[31m-          <span class="value muted">#{{ log.id }}</span>[m
[31m-        </div>[m
[31m-      </div>[m
[31m-[m
[31m-      <div class="log-details-json" *ngIf="log.details">[m
[31m-        <span class="label">Détails</span>[m
[31m-        <pre>{{ formatDetails(log.details) }}</pre>[m
[31m-      </div>[m
[31m-    </div>[m
[31m-  </div>[m
[31m-[m
[31m-  <div class="pagination" *ngIf="totalPages > 1">[m
[31m-    <button (click)="previousPage()" [disabled]="currentPage === 1">Précédent</button>[m
[31m-    <span class="page-info">Page {{ currentPage }} sur {{ totalPages }}</span>[m
[31m-    <button (click)="nextPage()" [disabled]="currentPage === totalPages">Suivant</button>[m
[31m-  </div>[m
[31m-</div>[m
[1mdiff --git a/boardpxl-frontend/src/app/logs/logs.scss b/boardpxl-frontend/src/app/logs/logs.scss[m
[1mdeleted file mode 100644[m
[1mindex 8e33f99..0000000[m
[1m--- a/boardpxl-frontend/src/app/logs/logs.scss[m
[1m+++ /dev/null[m
[36m@@ -1,318 +0,0 @@[m
[31m-[m
[31m-.logs-shell {[m
[31m-  background: #fff;[m
[31m-  border-radius: 20px;[m
[31m-  padding: 24px;[m
[31m-  margin: 24px 13px  13px 13px;[m
[31m-}[m
[31m-[m
[31m-.hero {[m
[31m-  display: flex;[m
[31m-  justify-content: space-between;[m
[31m-  gap: 16px;[m
[31m-  align-items: flex-start;[m
[31m-  margin-bottom: 18px;[m
[31m-[m
[31m-  .eyebrow {[m
[31m-    font-size: 12px;[m
[31m-    letter-spacing: 0.08em;[m
[31m-    text-transform: uppercase;[m
[31m-    color: #7e8a98;[m
[31m-    margin: 0 0 6px 0;[m
[31m-  }[m
[31m-[m
[31m-  h2 {[m
[31m-    font-family: 'FuturaLT-Bold';[m
[31m-    font-size: 26px;[m
[31m-    color: #2d3a4b;[m
[31m-    margin: 0;[m
[31m-  }[m
[31m-[m
[31m-  .subtitle {[m
[31m-    margin: 6px 0 0 0;[m
[31m-    color: #6c7a89;[m
[31m-    font-size: 14px;[m
[31m-  }[m
[31m-[m
[31m-  .stats {[m
[31m-    display: flex;[m
[31m-    gap: 12px;[m
[31m-  }[m
[31m-[m
[31m-  .stat-card {[m
[31m-    min-width: 140px;[m
[31m-    background: #fff;[m
[31m-    border-radius: 12px;[m
[31m-    padding: 12px 14px;[m
[31m-    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);[m
[31m-    border: 1px solid #eef1f5;[m
[31m-[m
[31m-    .label {[m
[31m-      margin: 0;[m
[31m-      font-size: 12px;[m
[31m-      color: #7e8a98;[m
[31m-    }[m
[31m-[m
[31m-    .value {[m
[31m-      margin: 4px 0 0 0;[m
[31m-      font-family: 'FuturaLT-Bold';[m
[31m-      font-size: 20px;[m
[31m-      color: #2d3a4b;[m
[31m-    }[m
[31m-  }[m
[31m-}[m
[31m-[m
[31m-.filters {[m
[31m-  display: grid;[m
[31m-  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));[m
[31m-  gap: 12px;[m
[31m-  background: #fff;[m
[31m-  border-radius: 14px;[m
[31m-  padding: 12px;[m
[31m-  border: 1px solid #eef1f5;[m
[31m-  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);[m
[31m-  margin: 0 auto 16px auto;[m
[31m-  position: sticky;[m
[31m-  top: calc(84px + 12px);[m
[31m-  z-index: 5;[m
[31m-  backdrop-filter: blur(6px);[m
[31m-  box-shadow: 0 6px 20px rgba(0,0,0,0.05);[m
[31m-[m
[31m-  .input-group,[m
[31m-  .input-group.search {[m
[31m-    min-width: 0;[m
[31m-    width: 100%;[m
[31m-  }[m
[31m-[m
[31m-  input, select {[m
[31m-    width: 100%;[m
[31m-    max-width: 100%;[m
[31m-    padding: 10px 12px;[m
[31m-    border: 1px solid #e6e9f0;[m
[31m-    border-radius: 10px;[m
[31m-    font-size: 0.95rem;[m
[31m-    background: #f6f7fb;[m
[31m-    transition: all 0.2s;[m
[31m-    outline: none;[m
[31m-    font-family: 'FuturaLT';[m
[31m-    box-sizing: border-box;[m
[31m-[m
[31m-    &:focus {[m
[31m-      border-color: #f98524;[m
[31m-      background: #fff;[m
[31m-      box-shadow: 0 0 0 3px rgba(249,133,36,0.12);[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  select {[m
[31m-    cursor: pointer;[m
[31m-  }[m
[31m-[m
[31m-  .date-range {[m
[31m-    display: grid;[m
[31m-    grid-template-columns: minmax(100px, 1fr) auto minmax(100px, 1fr);[m
[31m-    align-items: center;[m
[31m-    gap: 8px;[m
[31m-    min-width: 0;[m
[31m-[m
[31m-    input {[m
[31m-      width: 100%;[m
[31m-      min-width: 0;[m
[31m-    }[m
[31m-[m
[31m-    .dash {[m
[31m-      color: #9e9e9e;[m
[31m-      font-size: 14px;[m
[31m-    }[m
[31m-  }[m
[31m-}[m
[31m-[m
[31m-.logs-list {[m
[31m-  position: relative;[m
[31m-  padding-right: 8px;[m
[31m-  overflow-y: visible;[m
[31m-  max-height: none;[m
[31m-}[m
[31m-[m
[31m-.loading-overlay {[m
[31m-  position: absolute;[m
[31m-  top: 0;[m
[31m-  left: 0;[m
[31m-  right: 0;[m
[31m-  bottom: 0;[m
[31m-  background-color: rgba(255, 255, 255, 0.95);[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  align-items: center;[m
[31m-  justify-content: center;[m
[31m-  z-index: 100;[m
[31m-  border-radius: 10px;[m
[31m-[m
[31m-  p {[m
[31m-    margin-top: 20px;[m
[31m-    font-size: 18px;[m
[31m-    color: #f98524;[m
[31m-    font-weight: bold;[m
[31m-  }[m
[31m-}[m
[31m-[m
[31m-.spinner {[m
[31m-  width: 50px;[m
[31m-  height: 50px;[m
[31m-  border: 5px solid #f3f3f3;[m
[31m-  border-top: 5px solid #f98524;[m
[31m-  border-radius: 50%;[m
[31m-  animation: spin 1s linear infinite;[m
[31m-}[m
[31m-[m
[31m-@keyframes spin {[m
[31m-  0% { transform: rotate(0deg); }[m
[31m-  100% { transform: rotate(360deg); }[m
[31m-}[m
[31m-[m
[31m-.empty-state {[m
[31m-  text-align: center;[m
[31m-  padding: 60px 20px;[m
[31m-  color: #9e9e9e;[m
[31m-  font-size: 18px;[m
[31m-}[m
[31m-[m
[31m-.log-card {[m
[31m-  background: #fff;[m
[31m-  border-radius: 14px;[m
[31m-  padding: 16px;[m
[31m-  margin-bottom: 12px;[m
[31m-  border: 1px solid #eef1f5;[m
[31m-  transition: all 0.2s;[m
[31m-  z-index: 1;[m
[31m-  [m
[31m-  &:hover {[m
[31m-    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);[m
[31m-    transform: translateY(-2px);[m
[31m-  }[m
[31m-  [m
[31m-  .log-header {[m
[31m-    display: flex;[m
[31m-    justify-content: space-between;[m
[31m-    align-items: center;[m
[31m-    margin-bottom: 10px;[m
[31m-    gap: 10px;[m
[31m-[m
[31m-    .left {[m
[31m-      display: flex;[m
[31m-      align-items: center;[m
[31m-      gap: 8px;[m
[31m-      flex-wrap: wrap;[m
[31m-    }[m
[31m-    [m
[31m-    .log-action {[m
[31m-      font-family: 'FuturaLT-Bold';[m
[31m-      font-size: 16px;[m
[31m-      color: #2d3a4b;[m
[31m-    }[m
[31m-    [m
[31m-    .log-date {[m
[31m-      font-size: 13px;[m
[31m-      color: #7e8a98;[m
[31m-    }[m
[31m-  }[m
[31m-  [m
[31m-  .pill {[m
[31m-    display: inline-block;[m
[31m-    background: #fff5ec;[m
[31m-    color: #f98524;[m
[31m-    border-radius: 999px;[m
[31m-    padding: 6px 10px;[m
[31m-    font-size: 12px;[m
[31m-    border: 1px solid rgba(249,133,36,0.18);[m
[31m-    font-family: 'FuturaLT-Bold';[m
[31m-  }[m
[31m-[m
[31m-  .log-meta {[m
[31m-    display: grid;[m
[31m-    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));[m
[31m-    gap: 8px;[m
[31m-    margin: 6px 0 4px 0;[m
[31m-[m
[31m-    .label {[m
[31m-      display: block;[m
[31m-      font-family: 'FuturaLT-Bold';[m
[31m-      font-size: 12px;[m
[31m-      color: #7e8a98;[m
[31m-      margin-bottom: 2px;[m
[31m-    }[m
[31m-[m
[31m-    .value {[m
[31m-      font-size: 14px;[m
[31m-      color: #2d3a4b;[m
[31m-    }[m
[31m-[m
[31m-    .muted {[m
[31m-      color: #9aa5b3;[m
[31m-    }[m
[31m-  }[m
[31m-  [m
[31m-  .log-details-json {[m
[31m-    margin-top: 10px;[m
[31m-    padding-top: 10px;[m
[31m-    border-top: 1px dashed #e0e0e0;[m
[31m-    [m
[31m-    .label {[m
[31m-      font-family: 'FuturaLT-Bold';[m
[31m-      font-size: 13px;[m
[31m-      color: #7e8a98;[m
[31m-      display: block;[m
[31m-      margin-bottom: 8px;[m
[31m-    }[m
[31m-    [m
[31m-    pre {[m
[31m-      background: #f8f9fb;[m
[31m-      padding: 12px;[m
[31m-      border-radius: 10px;[m
[31m-      font-size: 13px;[m
[31m-      color: #2d3a4b;[m
[31m-      overflow-x: auto;[m
[31m-      margin: 0;[m
[31m-      font-family: 'Courier New', monospace;[m
[31m-      border: 1px solid #eef1f5;[m
[31m-    }[m
[31m-  }[m
[31m-}[m
[31m-[m
[31m-.pagination {[m
[31m-  display: flex;[m
[31m-  justify-content: center;[m
[31m-  align-items: center;[m
[31m-  gap: 16px;[m
[31m-  margin-top: 24px;[m
[31m-  padding-top: 20px;[m
[31m-  border-top: 1px solid #e0e0e0;[m
[31m-  [m
[31m-  button {[m
[31m-    padding: 10px 20px;[m
[31m-    background: #f98524;[m
[31m-    color: white;[m
[31m-    border: none;[m
[31m-    border-radius: 8px;[m
[31m-    cursor: pointer;[m
[31m-    font-family: 'FuturaLT-Bold';[m
[31m-    font-size: 14px;[m
[31m-    transition: all 0.2s;[m
[31m-    [m
[31m-    &:hover:not(:disabled) {[m
[31m-      background: #e07620;[m
[31m-      transform: translateY(-2px);[m
[31m-    }[m
[31m-    [m
[31m-    &:disabled {[m
[31m-      background: #e0e0e0;[m
[31m-      cursor: not-allowed;[m
[31m-      opacity: 0.6;[m
[31m-    }[m
[31m-  }[m
[31m-  [m
[31m-  .page-info {[m
[31m-    font-size: 14px;[m
[31m-    color: #7e8a98;[m
[31m-  }[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/logs/logs.spec.ts b/boardpxl-frontend/src/app/logs/logs.spec.ts[m
[1mdeleted file mode 100644[m
[1mindex f4994de..0000000[m
[1m--- a/boardpxl-frontend/src/app/logs/logs.spec.ts[m
[1m+++ /dev/null[m
[36m@@ -1,23 +0,0 @@[m
[31m-import { ComponentFixture, TestBed } from '@angular/core/testing';[m
[31m-[m
[31m-import { Logs } from './logs';[m
[31m-[m
[31m-describe('Logs', () => {[m
[31m-  let component: Logs;[m
[31m-  let fixture: ComponentFixture<Logs>;[m
[31m-[m
[31m-  beforeEach(async () => {[m
[31m-    await TestBed.configureTestingModule({[m
[31m-      declarations: [Logs][m
[31m-    })[m
[31m-    .compileComponents();[m
[31m-[m
[31m-    fixture = TestBed.createComponent(Logs);[m
[31m-    component = fixture.componentInstance;[m
[31m-    fixture.detectChanges();[m
[31m-  });[m
[31m-[m
[31m-  it('should create', () => {[m
[31m-    expect(component).toBeTruthy();[m
[31m-  });[m
[31m-});[m
[1mdiff --git a/boardpxl-frontend/src/app/logs/logs.ts b/boardpxl-frontend/src/app/logs/logs.ts[m
[1mdeleted file mode 100644[m
[1mindex c423a84..0000000[m
[1m--- a/boardpxl-frontend/src/app/logs/logs.ts[m
[1m+++ /dev/null[m
[36m@@ -1,144 +0,0 @@[m
[31m-import { Component, OnInit } from '@angular/core';[m
[31m-import { HttpClient } from '@angular/common/http';[m
[31m-import { HttpHeadersService } from '../services/http-headers.service';[m
[31m-import { environment } from '../../environments/environment.development';[m
[31m-[m
[31m-interface Log {[m
[31m-  id: number;[m
[31m-  action: string;[m
[31m-  user_id: number;[m
[31m-  photographer_name?: string;[m
[31m-  table_name: string;[m
[31m-  ip_address: string;[m
[31m-  details: string | object;[m
[31m-  created_at: string;[m
[31m-}[m
[31m-[m
[31m-@Component({[m
[31m-  selector: 'app-logs',[m
[31m-  standalone: false,[m
[31m-  templateUrl: './logs.html',[m
[31m-  styleUrl: './logs.scss',[m
[31m-})[m
[31m-export class Logs implements OnInit {[m
[31m-  logs: Log[] = [];[m
[31m-  filteredLogs: Log[] = [];[m
[31m-  pagedLogs: Log[] = [];[m
[31m-  isLoading = false;[m
[31m-  [m
[31m-  // Filters[m
[31m-  searchTerm = '';[m
[31m-  selectedAction = '';[m
[31m-  startDate = '';[m
[31m-  endDate = '';[m
[31m-  uniqueActions: string[] = [];[m
[31m-  [m
[31m-  // Pagination[m
[31m-  currentPage = 1;[m
[31m-  pageSize = 20;[m
[31m-  totalPages = 1;[m
[31m-  readonly apiUrl = environment.apiUrl;[m
[31m-[m
[31m-  constructor([m
[31m-    private http: HttpClient,[m
[31m-    private httpHeadersService: HttpHeadersService,[m
[31m-  ) {}[m
[31m-[m
[31m-  ngOnInit() {[m
[31m-    this.loadLogs();[m
[31m-  }[m
[31m-[m
[31m-  loadLogs() {[m
[31m-    this.isLoading = true;[m
[31m-    this.http[m
[31m-      .get<Log[]>(`${this.apiUrl}/logs`, this.httpHeadersService.getAuthHeaders())[m
[31m-      .subscribe({[m
[31m-        next: (logs) => {[m
[31m-          this.logs = logs || [];[m
[31m-          this.extractUniqueActions();[m
[31m-          this.filterLogs();[m
[31m-          this.isLoading = false;[m
[31m-        },[m
[31m-        error: () => {[m
[31m-          this.logs = [];[m
[31m-          this.filteredLogs = [];[m
[31m-          this.pagedLogs = [];[m
[31m-          this.totalPages = 1;[m
[31m-          this.isLoading = false;[m
[31m-        },[m
[31m-      });[m
[31m-  }[m
[31m-[m
[31m-  extractUniqueActions() {[m
[31m-    const actions = new Set(this.logs.map(log => log.action));[m
[31m-    this.uniqueActions = Array.from(actions).sort();[m
[31m-  }[m
[31m-[m
[31m-  filterLogs() {[m
[31m-    let filtered = [...this.logs];[m
[31m-[m
[31m-    // Filter by search term[m
[31m-    if (this.searchTerm) {[m
[31m-      const term = this.searchTerm.toLowerCase();[m
[31m-      filtered = filtered.filter(log => [m
[31m-        log.action.toLowerCase().includes(term) ||[m
[31m-        log.table_name?.toLowerCase().includes(term) ||[m
[31m-        log.ip_address?.toLowerCase().includes(term)[m
[31m-      );[m
[31m-    }[m
[31m-[m
[31m-    // Filter by action[m
[31m-    if (this.selectedAction) {[m
[31m-      filtered = filtered.filter(log => log.action === this.selectedAction);[m
[31m-    }[m
[31m-[m
[31m-    // Filter by date range[m
[31m-    if (this.startDate) {[m
[31m-      filtered = filtered.filter(log => [m
[31m-        new Date(log.created_at) >= new Date(this.startDate)[m
[31m-      );[m
[31m-    }[m
[31m-[m
[31m-    if (this.endDate) {[m
[31m-      filtered = filtered.filter(log => [m
[31m-        new Date(log.created_at) <= new Date(this.endDate + 'T23:59:59')[m
[31m-      );[m
[31m-    }[m
[31m-[m
[31m-    this.filteredLogs = filtered;[m
[31m-    this.totalPages = Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));[m
[31m-    this.currentPage = 1;[m
[31m-    this.paginateLogs();[m
[31m-  }[m
[31m-[m
[31m-  paginateLogs() {[m
[31m-    const start = (this.currentPage - 1) * this.pageSize;[m
[31m-    const end = start + this.pageSize;[m
[31m-    this.pagedLogs = this.filteredLogs.slice(start, end);[m
[31m-  }[m
[31m-[m
[31m-  previousPage() {[m
[31m-    if (this.currentPage > 1) {[m
[31m-      this.currentPage--;[m
[31m-      this.paginateLogs();[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  nextPage() {[m
[31m-    if (this.currentPage < this.totalPages) {[m
[31m-      this.currentPage++;[m
[31m-      this.paginateLogs();[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  formatDetails(details: string | object): string {[m
[31m-    if (typeof details === 'string') {[m
[31m-      try {[m
[31m-        return JSON.stringify(JSON.parse(details), null, 2);[m
[31m-      } catch {[m
[31m-        return details;[m
[31m-      }[m
[31m-    }[m
[31m-    return JSON.stringify(details, null, 2);[m
[31m-  }[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/mails-log/mails-log.html b/boardpxl-frontend/src/app/mails-log/mails-log.html[m
[1mdeleted file mode 100644[m
[1mindex 29b10d8..0000000[m
[1m--- a/boardpxl-frontend/src/app/mails-log/mails-log.html[m
[1m+++ /dev/null[m
[36m@@ -1,37 +0,0 @@[m
[31m-<app-title [title]="'HISTORIQUE DES EMAILS'" [icon]="'assets/images/logo-tableau-de-bord.png'"></app-title>[m
[31m-<div class="container">[m
[31m-    <div class="header">[m
[31m-        <app-search-bar [placeholder]="'Rechercher un email...'" (filter)="onSearch($event)"></app-search-bar>[m
[31m-    </div>[m
[31m-    <div class="mails-list">[m
[31m-        <div class="loading-overlay" *ngIf="isLoading">[m
[31m-            <div class="spinner"></div>[m
[31m-            <p>Chargement des emails...</p>[m
[31m-        </div>[m
[31m-        <div class="mail-item" *ngFor="let mail of filteredMails">[m
[31m-            <div class="card" (click)="toggleMailBody(mail.id)" [class.expanded]="isExpanded(mail.id)">[m
[31m-                <div class="mail-info">[m
[31m-                    <div class="main-info">[m
[31m-                        <p class="recipient">{{ mail.recipient }}</p>[m
[31m-                        <p class="subject">{{ mail.subject }}</p>[m
[31m-                    </div>[m
[31m-                </div>[m
[31m-                <div class="mail-details">[m
[31m-                    <div class="type-badge">{{ getTypeLabel(mail.type) }}</div>[m
[31m-                    <div class="status-badge" [ngClass]="'status-' + mail.status.toLowerCase()">[m
[31m-                        {{ getStatusLabel(mail.status) }}[m
[31m-                    </div>[m
[31m-                </div>[m
[31m-                <div class="date-info">[m
[31m-                    <p class="date">{{ mail.created_at | date: 'mediumDate' }}</p>[m
[31m-                </div>[m
[31m-            </div>[m
[31m-            <div class="mail-body" [class.show]="isExpanded(mail.id)">[m
[31m-                <div class="body-content" [innerHTML]="mail.body"></div>[m
[31m-            </div>[m
[31m-        </div>[m
[31m-        <div class="no-results" *ngIf="!isLoading && filteredMails.length === 0">[m
[31m-            <p>Aucun email trouvé</p>[m
[31m-        </div>[m
[31m-    </div>[m
[31m-</div>[m
[1mdiff --git a/boardpxl-frontend/src/app/mails-log/mails-log.scss b/boardpxl-frontend/src/app/mails-log/mails-log.scss[m
[1mdeleted file mode 100644[m
[1mindex 35c98dc..0000000[m
[1m--- a/boardpxl-frontend/src/app/mails-log/mails-log.scss[m
[1m+++ /dev/null[m
[36m@@ -1,247 +0,0 @@[m
[31m-.container {[m
[31m-    margin: 0 13px 13px 13px;[m
[31m-    padding: 1.5rem;[m
[31m-    background: white;[m
[31m-    border-radius: 10px;[m
[31m-}[m
[31m-[m
[31m-.header {[m
[31m-    display: flex;[m
[31m-    justify-content: flex-end;[m
[31m-    align-items: center;[m
[31m-    margin-bottom: 13px;[m
[31m-[m
[31m-    app-search-bar {[m
[31m-        flex-shrink: 0;[m
[31m-    }[m
[31m-}[m
[31m-[m
[31m-.mails-list {[m
[31m-    position: relative;[m
[31m-    display: flex;[m
[31m-    flex-direction: column;[m
[31m-    gap: 1rem;[m
[31m-}[m
[31m-[m
[31m-.loading-overlay {[m
[31m-    display: flex;[m
[31m-    flex-direction: column;[m
[31m-    align-items: center;[m
[31m-    justify-content: center;[m
[31m-    padding: 3rem 2rem;[m
[31m-[m
[31m-    .spinner {[m
[31m-        width: 40px;[m
[31m-        height: 40px;[m
[31m-        border: 4px solid #f0f0f0;[m
[31m-        border-top: 4px solid #FF6B35;[m
[31m-        border-radius: 50%;[m
[31m-        animation: spin 1s linear infinite;[m
[31m-        margin-bottom: 1rem;[m
[31m-    }[m
[31m-[m
[31m-    p {[m
[31m-        color: #666;[m
[31m-        font-size: 0.95rem;[m
[31m-    }[m
[31m-}[m
[31m-[m
[31m-.mail-item {[m
[31m-    .card {[m
[31m-        background: white;[m
[31m-        border-radius: 8px;[m
[31m-        padding: 1.5rem;[m
[31m-        border: 1px solid #e0e0e0;[m
[31m-        display: flex;[m
[31m-        justify-content: space-between;[m
[31m-        align-items: center;[m
[31m-        transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;[m
[31m-        cursor: pointer;[m
[31m-        position: relative;[m
[31m-[m
[31m-        &:hover {[m
[31m-            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);[m
[31m-            transform: translateY(-2px);[m
[31m-        }[m
[31m-[m
[31m-        &.expanded {[m
[31m-            border-color: #FF6B35;[m
[31m-            border-bottom-left-radius: 0;[m
[31m-            border-bottom-right-radius: 0;[m
[31m-        }[m
[31m-[m
[31m-        &::after {[m
[31m-            content: '▼';[m
[31m-            font-size: 0.75rem;[m
[31m-            color: #999;[m
[31m-            margin-left: 1rem;[m
[31m-            transition: transform 0.3s ease;[m
[31m-        }[m
[31m-[m
[31m-        &.expanded::after {[m
[31m-            transform: rotate(180deg);[m
[31m-        }[m
[31m-    }[m
[31m-[m
[31m-    .mail-body {[m
[31m-        background: #f9f9f9;[m
[31m-        border: 1px solid #FF6B35;[m
[31m-        border-top: none;[m
[31m-        border-bottom-left-radius: 8px;[m
[31m-        border-bottom-right-radius: 8px;[m
[31m-        max-height: 0;[m
[31m-        overflow: hidden;[m
[31m-        padding: 0 1.5rem;[m
[31m-        opacity: 0;[m
[31m-        transition: max-height 0.4s ease, padding 0.4s ease, opacity 0.3s ease;[m
[31m-[m
[31m-        &.show {[m
[31m-            max-height: 1000px;[m
[31m-            padding: 1.5rem;[m
[31m-            opacity: 1;[m
[31m-        }[m
[31m-[m
[31m-        .body-content {[m
[31m-            color: #333;[m
[31m-            font-size: 0.95rem;[m
[31m-            line-height: 1.6;[m
[31m-            word-wrap: break-word;[m
[31m-        }[m
[31m-    }[m
[31m-[m
[31m-    .mail-info {[m
[31m-        flex: 1;[m
[31m-[m
[31m-        .main-info {[m
[31m-            .recipient {[m
[31m-                font-size: 1rem;[m
[31m-                font-weight: 600;[m
[31m-                color: #333;[m
[31m-                margin: 0 0 0.5rem 0;[m
[31m-            }[m
[31m-[m
[31m-            .subject {[m
[31m-                font-size: 0.95rem;[m
[31m-                color: #666;[m
[31m-                margin: 0;[m
[31m-                overflow: hidden;[m
[31m-                text-overflow: ellipsis;[m
[31m-                white-space: nowrap;[m
[31m-            }[m
[31m-        }[m
[31m-    }[m
[31m-[m
[31m-    .mail-details {[m
[31m-        display: flex;[m
[31m-        gap: 0.75rem;[m
[31m-        margin: 0 2rem;[m
[31m-        flex-shrink: 0;[m
[31m-[m
[31m-        .type-badge {[m
[31m-            background: #FFF3E0;[m
[31m-            color: #FF6B35;[m
[31m-            padding: 0.5rem 1rem;[m
[31m-            border-radius: 20px;[m
[31m-            font-size: 0.85rem;[m
[31m-            font-weight: 500;[m
[31m-        }[m
[31m-[m
[31m-        .status-badge {[m
[31m-            padding: 0.5rem 1rem;[m
[31m-            border-radius: 20px;[m
[31m-            font-size: 0.85rem;[m
[31m-            font-weight: 500;[m
[31m-[m
[31m-            &.status-sent {[m
[31m-                background: #E8F5E9;[m
[31m-                color: #4CAF50;[m
[31m-            }[m
[31m-[m
[31m-            &.status-failed {[m
[31m-                background: #FFEBEE;[m
[31m-                color: #F44336;[m
[31m-            }[m
[31m-[m
[31m-            &.status-pending {[m
[31m-                background: #FFF9C4;[m
[31m-                color: #FBC02D;[m
[31m-            }[m
[31m-        }[m
[31m-    }[m
[31m-[m
[31m-    .date-info {[m
[31m-        flex-shrink: 0;[m
[31m-[m
[31m-        .date {[m
[31m-            font-size: 0.9rem;[m
[31m-            color: #999;[m
[31m-            margin: 0;[m
[31m-            white-space: nowrap;[m
[31m-        }[m
[31m-    }[m
[31m-}[m
[31m-[m
[31m-.no-results {[m
[31m-    text-align: center;[m
[31m-    padding: 3rem 2rem;[m
[31m-    color: #999;[m
[31m-    font-size: 1rem;[m
[31m-[m
[31m-    p {[m
[31m-        margin: 0;[m
[31m-    }[m
[31m-}[m
[31m-[m
[31m-@keyframes spin {[m
[31m-    to {[m
[31m-        transform: rotate(360deg);[m
[31m-    }[m
[31m-}[m
[31m-[m
[31m-@keyframes slideDown {[m
[31m-    from {[m
[31m-        opacity: 0;[m
[31m-        max-height: 0;[m
[31m-        padding-top: 0;[m
[31m-        padding-bottom: 0;[m
[31m-    }[m
[31m-    to {[m
[31m-        opacity: 1;[m
[31m-        max-height: 500px;[m
[31m-        padding-top: 1.5rem;[m
[31m-        padding-bottom: 1.5rem;[m
[31m-    }[m
[31m-}[m
[31m-[m
[31m-@media (max-width: 768px) {[m
[31m-    .container {[m
[31m-        margin: 1.5rem;[m
[31m-    }[m
[31m-[m
[31m-    .header {[m
[31m-        flex-direction: column;[m
[31m-        gap: 1rem;[m
[31m-        align-items: stretch;[m
[31m-[m
[31m-        p {[m
[31m-            font-size: 1.5rem;[m
[31m-        }[m
[31m-    }[m
[31m-[m
[31m-    .mail-item {[m
[31m-        .card {[m
[31m-            flex-direction: column;[m
[31m-            align-items: flex-start;[m
[31m-            padding: 1rem;[m
[31m-        }[m
[31m-[m
[31m-        .mail-details {[m
[31m-            width: 100%;[m
[31m-            margin: 1rem 0;[m
[31m-        }[m
[31m-[m
[31m-        .date-info {[m
[31m-            width: 100%;[m
[31m-        }[m
[31m-    }[m
[31m-}[m
\ No newline at end of file[m
[1mdiff --git a/boardpxl-frontend/src/app/mails-log/mails-log.spec.ts b/boardpxl-frontend/src/app/mails-log/mails-log.spec.ts[m
[1mdeleted file mode 100644[m
[1mindex 6a15ad6..0000000[m
[1m--- a/boardpxl-frontend/src/app/mails-log/mails-log.spec.ts[m
[1m+++ /dev/null[m
[36m@@ -1,23 +0,0 @@[m
[31m-import { ComponentFixture, TestBed } from '@angular/core/testing';[m
[31m-[m
[31m-import { MailsLog } from './mails-log';[m
[31m-[m
[31m-describe('MailsLog', () => {[m
[31m-  let component: MailsLog;[m
[31m-  let fixture: ComponentFixture<MailsLog>;[m
[31m-[m
[31m-  beforeEach(async () => {[m
[31m-    await TestBed.configureTestingModule({[m
[31m-      declarations: [MailsLog][m
[31m-    })[m
[31m-    .compileComponents();[m
[31m-[m
[31m-    fixture = TestBed.createComponent(MailsLog);[m
[31m-    component = fixture.componentInstance;[m
[31m-    fixture.detectChanges();[m
[31m-  });[m
[31m-[m
[31m-  it('should create', () => {[m
[31m-    expect(component).toBeTruthy();[m
[31m-  });[m
[31m-});[m
[1mdiff --git a/boardpxl-frontend/src/app/mails-log/mails-log.ts b/boardpxl-frontend/src/app/mails-log/mails-log.ts[m
[1mdeleted file mode 100644[m
[1mindex fbd7ab2..0000000[m
[1m--- a/boardpxl-frontend/src/app/mails-log/mails-log.ts[m
[1m+++ /dev/null[m
[36m@@ -1,103 +0,0 @@[m
[31m-import { Component, OnDestroy } from '@angular/core';[m
[31m-import { AuthService } from '../services/auth-service';[m
[31m-import { Subject } from 'rxjs';[m
[31m-import { takeUntil } from 'rxjs/operators';[m
[31m-import { MailService } from '../services/mail-service';[m
[31m-[m
[31m-@Component({[m
[31m-  selector: 'app-mails-log',[m
[31m-  standalone: false,[m
[31m-  templateUrl: './mails-log.html',[m
[31m-  styleUrl: './mails-log.scss',[m
[31m-})[m
[31m-export class MailsLog implements OnDestroy {[m
[31m-  protected mails: any[] = [];[m
[31m-  protected filteredMails: any[] = [];[m
[31m-  protected isLoading: boolean = true;[m
[31m-  protected searchQuery: string = '';[m
[31m-  protected expandedMailId: number | null = null;[m
[31m-  private destroy$ = new Subject<void>();[m
[31m-[m
[31m-  constructor(private authService: AuthService, private mailService: MailService) {[m
[31m-    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {[m
[31m-      this.destroy$.next();[m
[31m-    });[m
[31m-  }[m
[31m-[m
[31m-  ngOnInit() {[m
[31m-    this.isLoading = true;[m
[31m-[m
[31m-    requestAnimationFrame(() => {[m
[31m-      const el = document.querySelector('.mails-list') as HTMLElement | null;[m
[31m-      if (!el) return;[m
[31m-      const rect = el.getBoundingClientRect();[m
[31m-      const y = rect.top + window.scrollY;[m
[31m-      el.style.height = `calc(100vh - ${y}px - 10px)`;[m
[31m-    });[m
[31m-[m
[31m-    this.mailService.getMailLogs(this.authService.getUser()?.id || 0)[m
[31m-      .pipe(takeUntil(this.destroy$))[m
[31m-      .subscribe({[m
[31m-        next: mails => {[m
[31m-          this.mails = mails;[m
[31m-          this.filteredMails = this.mails;[m
[31m-          this.isLoading = false;[m
[31m-        },[m
[31m-        error: error => {[m
[31m-          console.error('Failed to load mail logs', error);[m
[31m-          this.isLoading = false;[m
[31m-        }[m
[31m-      });[m
[31m-  }[m
[31m-[m
[31m-  onSearch(query: string) {[m
[31m-    this.searchQuery = query;[m
[31m-    if (query.trim() === '') {[m
[31m-      this.filteredMails = this.mails;[m
[31m-    } else {[m
[31m-      this.filteredMails = this.mails.filter(mail =>[m
[31m-        mail.recipient.toLowerCase().includes(query.toLowerCase()) ||[m
[31m-        mail.subject.toLowerCase().includes(query.toLowerCase())[m
[31m-      );[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  getStatusLabel(status: string): string {[m
[31m-    switch (status.toLowerCase()) {[m
[31m-      case 'sent':[m
[31m-        return 'Envoyé';[m
[31m-      case 'failed':[m
[31m-        return 'Échec';[m
[31m-      case 'pending':[m
[31m-        return 'En attente';[m
[31m-      default:[m
[31m-        return status;[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  getTypeLabel(type: string): string {[m
[31m-    switch (type.toLowerCase()) {[m
[31m-      case 'versement':[m
[31m-        return 'Versement';[m
[31m-      case 'crédits':[m
[31m-        return 'Crédits';[m
[31m-      case 'generic':[m
[31m-        return 'Générique';[m
[31m-      default:[m
[31m-        return type;[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  toggleMailBody(mailId: number): void {[m
[31m-    this.expandedMailId = this.expandedMailId === mailId ? null : mailId;[m
[31m-  }[m
[31m-[m
[31m-  isExpanded(mailId: number): boolean {[m
[31m-    return this.expandedMailId === mailId;[m
[31m-  }[m
[31m-[m
[31m-  ngOnDestroy(): void {[m
[31m-    this.destroy$.next();[m
[31m-    this.destroy$.complete();[m
[31m-  }[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/models/mail.model.spec.ts b/boardpxl-frontend/src/app/models/mail.model.spec.ts[m
[1mdeleted file mode 100644[m
[1mindex 7f4be7c..0000000[m
[1m--- a/boardpxl-frontend/src/app/models/mail.model.spec.ts[m
[1m+++ /dev/null[m
[36m@@ -1,7 +0,0 @@[m
[31m-import { Mail } from './mailmodel';[m
[31m-[m
[31m-describe('Mail', () => {[m
[31m-  it('should create an instance', () => {[m
[31m-    expect(new Mail()).toBeTruthy();[m
[31m-  });[m
[31m-});[m
[1mdiff --git a/boardpxl-frontend/src/app/models/mail.model.ts b/boardpxl-frontend/src/app/models/mail.model.ts[m
[1mdeleted file mode 100644[m
[1mindex f090a0f..0000000[m
[1m--- a/boardpxl-frontend/src/app/models/mail.model.ts[m
[1m+++ /dev/null[m
[36m@@ -1,21 +0,0 @@[m
[31m-export class Mail {[m
[31m-    to!: string;[m
[31m-    sender_id!: number;[m
[31m-    from!: string;[m
[31m-    recipient!: string;[m
[31m-    subject!: string;[m
[31m-    body!: string;[m
[31m-    type!: string;[m
[31m-    status!: string;[m
[31m-    created_at!: Date;[m
[31m-[m
[31m-    constructor(to: string, sender_id: number, from: string, subject: string, body: string, type: string, created_at: Date) {[m
[31m-        this.to = to;[m
[31m-        this.sender_id = sender_id;[m
[31m-        this.from = from;[m
[31m-        this.subject = subject;[m
[31m-        this.body = body;[m
[31m-        this.type = type;[m
[31m-        this.created_at = created_at;[m
[31m-    }[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/navigation-bar/navigation-bar.html b/boardpxl-frontend/src/app/navigation-bar/navigation-bar.html[m
[1mindex e54a60e..f23f531 100644[m
[1m--- a/boardpxl-frontend/src/app/navigation-bar/navigation-bar.html[m
[1m+++ b/boardpxl-frontend/src/app/navigation-bar/navigation-bar.html[m
[36m@@ -2,33 +2,10 @@[m
    <nav [class.open]="isOpen">[m
       <ul>[m
          <li *ngFor="let page of pages">[m
[31m-            <a *ngIf="page.route && !isActivePage(page.route)" [routerLink]="page.route" [queryParams]="page.queryParams">[m
[32m+[m[32m            <a [routerLink]="page.route">[m
                <img [src]="page.icon" class="navbar-icon" [alt]="page.label">[m
                {{ page.label }}[m
             </a>[m
[31m-            <div *ngIf="page.route && isActivePage(page.route)" class="active-link">[m
[31m-               <img [src]="page.icon" class="navbar-icon" [alt]="page.label">[m
[31m-               {{ page.label }}[m
[31m-            </div>[m
[31m-            <div *ngIf="!page.route" class="parent-page">[m
[31m-               <div class="parent-label">[m
[31m-                  <img [src]="page.icon" class="navbar-icon" [alt]="page.label">[m
[31m-                  {{ page.label }}[m
[31m-               </div>[m
[31m-               <span class="chevron"></span>[m
[31m-            </div>[m
[31m-            <ul *ngIf="page.subPages" class="sub-pages">[m
[31m-               <li *ngFor="let subPage of page.subPages">[m
[31m-                  <a *ngIf="!isActivePage(subPage.route)" [routerLink]="subPage.route" [queryParams]="subPage.queryParams">[m
[31m-                     <img [src]="subPage.icon" class="navbar-icon" [alt]="subPage.label">[m
[31m-                     {{ subPage.label }}[m
[31m-                  </a>[m
[31m-                  <div *ngIf="isActivePage(subPage.route)" class="active-link">[m
[31m-                     <img [src]="subPage.icon" class="navbar-icon" [alt]="subPage.label">[m
[31m-                     {{ subPage.label }}[m
[31m-                  </div>[m
[31m-               </li>[m
[31m-            </ul>[m
          </li>[m
       </ul>[m
       <div class="disconnect-container">[m
[1mdiff --git a/boardpxl-frontend/src/app/navigation-bar/navigation-bar.scss b/boardpxl-frontend/src/app/navigation-bar/navigation-bar.scss[m
[1mindex 3b39be0..a44f0b8 100644[m
[1m--- a/boardpxl-frontend/src/app/navigation-bar/navigation-bar.scss[m
[1m+++ b/boardpxl-frontend/src/app/navigation-bar/navigation-bar.scss[m
[36m@@ -25,96 +25,6 @@[m [mnav {[m
         margin-bottom: 10px;[m
     }[m
 [m
[31m-    .parent-page {[m
[31m-        display: flex;[m
[31m-        align-items: center;[m
[31m-        justify-content: space-between;[m
[31m-        width: 230px;[m
[31m-        height: 44px;[m
[31m-        background-color: #ffffff;[m
[31m-        border-radius: 8px;[m
[31m-        color: #000000;[m
[31m-        font-size: 16px;[m
[31m-        font-weight: 600;[m
[31m-        padding: 0 8px 0 4px;[m
[31m-        gap: 8px;[m
[31m-[m
[31m-        .navbar-icon {[m
[31m-            margin-left: 6px;[m
[31m-        }[m
[31m-[m
[31m-        .chevron {[m
[31m-            width: 18px;[m
[31m-            height: 18px;[m
[31m-            opacity: 0; /* hide arrow */[m
[31m-        }[m
[31m-    }[m
[31m-[m
[31m-    .active-link {[m
[31m-        display: flex;[m
[31m-        align-items: center;[m
[31m-        justify-content: left;[m
[31m-        width: 230px;[m
[31m-        height: 44px;[m
[31m-        background-color: #E8EAF6;[m
[31m-        border-radius: 8px;[m
[31m-        color: #F98524;[m
[31m-        font-size: 16px;[m
[31m-        cursor: default;[m
[31m-        pointer-events: none;[m
[31m-[m
[31m-        .navbar-icon {[m
[31m-            filter: invert(77%) sepia(37%) saturate(7323%) hue-rotate(345deg) brightness(101%) contrast(95%);[m
[31m-        }[m
[31m-    }[m
[31m-[m
[31m-    .sub-pages {[m
[31m-        list-style: none;[m
[31m-        padding: 0;[m
[31m-        margin: 8px 0 0;[m
[31m-        border-left: 2px solid #e0e0e0;[m
[31m-        padding-left: 16px;[m
[31m-        display: flex;[m
[31m-        flex-direction: column;[m
[31m-        gap: 8px;[m
[31m-[m
[31m-        li {[m
[31m-            margin: 0;[m
[31m-        }[m
[31m-[m
[31m-        a,[m
[31m-        .active-link {[m
[31m-            width: 200px;[m
[31m-            height: 40px;[m
[31m-            border-radius: 8px;[m
[31m-            padding-left: 4px;[m
[31m-            padding-right: 8px;[m
[31m-        }[m
[31m-[m
[31m-        a {[m
[31m-            background: transparent;[m
[31m-            color: #000;[m
[31m-        }[m
[31m-[m
[31m-        a:hover {[m
[31m-            background-color: #E8EAF6;[m
[31m-            color: #F98524;[m
[31m-[m
[31m-            .navbar-icon {[m
[31m-                filter: invert(77%) sepia(37%) saturate(7323%) hue-rotate(345deg) brightness(101%) contrast(95%);[m
[31m-            }[m
[31m-        }[m
[31m-[m
[31m-        .active-link {[m
[31m-            background-color: #E8EAF6;[m
[31m-            color: #F98524;[m
[31m-[m
[31m-            .navbar-icon {[m
[31m-                filter: invert(77%) sepia(37%) saturate(7323%) hue-rotate(345deg) brightness(101%) contrast(95%);[m
[31m-            }[m
[31m-        }[m
[31m-    }[m
[31m-[m
     a {[m
         display: flex;[m
         align-items: center;[m
[36m@@ -129,17 +39,7 @@[m [mnav {[m
         transition: background-color 0.3s ease, color 0.3s ease;[m
         font-size: 16px;[m
 [m
[31m-        &:hover,[m
[31m-        &.active {[m
[31m-            background-color: #E8EAF6;[m
[31m-            color: #F98524;[m
[31m-[m
[31m-            .navbar-icon {[m
[31m-                filter: invert(77%) sepia(37%) saturate(7323%) hue-rotate(345deg) brightness(101%) contrast(95%);[m
[31m-            }[m
[31m-        }[m
[31m-[m
[31m-        &.active {[m
[32m+[m[32m        &:hover {[m
             background-color: #E8EAF6;[m
             color: #F98524;[m
 [m
[1mdiff --git a/boardpxl-frontend/src/app/navigation-bar/navigation-bar.ts b/boardpxl-frontend/src/app/navigation-bar/navigation-bar.ts[m
[1mindex 3c3a5ff..6becbae 100644[m
[1m--- a/boardpxl-frontend/src/app/navigation-bar/navigation-bar.ts[m
[1m+++ b/boardpxl-frontend/src/app/navigation-bar/navigation-bar.ts[m
[36m@@ -1,16 +1,12 @@[m
[31m-import { Component, Input, OnDestroy } from '@angular/core';[m
[32m+[m[32mimport { Component, Input } from '@angular/core';[m
 import { AuthService } from '../services/auth-service';[m
[31m-import { Router, NavigationEnd } from '@angular/router';[m
[32m+[m[32mimport { Router } from '@angular/router';[m
 import { RoleService } from '../services/role.service';[m
[31m-import { Subject } from 'rxjs';[m
[31m-import { filter, takeUntil } from 'rxjs/operators';[m
 [m
 interface NavPage {[m
   label: string;[m
   route: string;[m
   icon: string;[m
[31m-  subPages?: NavPage[];[m
[31m-  queryParams?: Record<string, string>;[m
 }[m
 [m
 interface LegalLink {[m
[36m@@ -24,24 +20,29 @@[m [minterface LegalLink {[m
   templateUrl: './navigation-bar.html',[m
   styleUrl: './navigation-bar.scss',[m
 })[m
[31m-export class NavigationBar implements OnDestroy {[m
[32m+[m[32mexport class NavigationBar {[m
   @Input() isOpen: boolean = false;[m
   pages: NavPage[] = [];[m
   legalLinks: LegalLink[] = [];[m
[31m-  private destroy$ = new Subject<void>();[m
 [m
   constructor(private authService: AuthService, private router: Router, private roleService: RoleService) {}[m
 [m
   ngOnInit() {[m
[31m-    this.updateNavigation();[m
[32m+[m[32m    const role = this.roleService.getRole();[m
[32m+[m[32m    const dashboardRoute = role === 'admin' ? '/photographers' : '/';[m
 [m
[31m-    // Écouter les changements de route[m
[31m-    this.router.events.pipe([m
[31m-      filter(event => event instanceof NavigationEnd),[m
[31m-      takeUntil(this.destroy$)[m
[31m-    ).subscribe(() => {[m
[31m-      this.updateNavigation();[m
[31m-    });[m
[32m+[m[32m    this.pages = [[m
[32m+[m[32m      {[m
[32m+[m[32m        label: 'Tableau de bord',[m
[32m+[m[32m        route: dashboardRoute,[m
[32m+[m[32m        icon: 'assets/images/liste_icon.svg'[m
[32m+[m[32m      },[m
[32m+[m[32m      // {[m
[32m+[m[32m      //   label: 'Graphique général',[m
[32m+[m[32m      //   route: '/general-graph',[m
[32m+[m[32m      //   icon: 'assets/images/graphic_icon.svg'[m
[32m+[m[32m      // }[m
[32m+[m[32m    ];[m
 [m
     this.legalLinks = [[m
       {[m
[36m@@ -59,85 +60,10 @@[m [mexport class NavigationBar implements OnDestroy {[m
     ];[m
   }[m
 [m
[31m-  updateNavigation() {[m
[31m-    const currentUrl = this.router.url;[m
[31m-    const currentUrlWithoutParams = currentUrl.split('?')[0];[m
[31m-    [m
[31m-    // Route par défaut[m
[31m-    this.pages = [[m
[31m-      {[m
[31m-        label: 'Tableau de bord',[m
[31m-        route: '/',[m
[31m-        icon: 'assets/images/liste_icon.svg'[m
[31m-      }[m
[31m-    ];[m
[31m-    [m
[31m-    if (this.roleService.getRole() === 'photographer') {[m
[31m-      this.pages.push({[m
[31m-        label: 'Historique des emails',[m
[31m-        route: '/mails',[m
[31m-        icon: 'assets/images/mail_icon.svg'[m
[31m-      });[m
[31m-    }[m
[31m-[m
[31m-    // Si on est sur la page de liste des photographes[m
[31m-    if (this.roleService.getRole() === 'admin') {[m
[31m-      this.pages = [[m
[31m-        {[m
[31m-          label: 'Liste des photographes',[m
[31m-          route: '/photographers',[m
[31m-          icon: 'assets/images/liste_icon.svg'[m
[31m-        },[m
[31m-        {[m
[31m-          label: 'Logs',[m
[31m-          route: '/logs',[m
[31m-          icon: 'assets/images/logs_icon.svg'[m
[31m-        }[m
[31m-      ];[m
[31m-[m
[31m-      // Si on est sur la page profil ou factures d'un photographe[m
[31m-      const invoiceMatch = currentUrl.match(/\/photographer\/(\d+)\/invoices/);[m
[31m-      const profileMatch = currentUrl.match(/\/photographer\/(\d+)/);[m
[31m-      const photographerId = invoiceMatch?.[1] ?? profileMatch?.[1] ?? null;[m
[31m-[m
[31m-      if (photographerId) {[m
[31m-        const photographerName = new URLSearchParams(window.location.search).get('name') || 'Photographe';[m
[31m-        const profileRoute = `/photographer/${photographerId}`;[m
[31m-        const invoicesRoute = `/photographer/${photographerId}/invoices`;[m
[31m-        const queryParams = photographerName ? { name: photographerName } : undefined;[m
[31m-[m
[31m-        this.pages.push({[m
[31m-          label: photographerName,[m
[31m-          route: '',[m
[31m-          icon: 'assets/images/photographer_icon.svg',[m
[31m-          subPages: [[m
[31m-            {[m
[31m-              label: 'Profil',[m
[31m-              route: profileRoute,[m
[31m-              icon: 'assets/images/profile_info_icon.svg',[m
[31m-              queryParams[m
[31m-            },[m
[31m-            {[m
[31m-              label: 'Historique des factures',[m
[31m-              route: invoicesRoute,[m
[31m-              icon: 'assets/images/histofacture_icon.svg',[m
[31m-              queryParams[m
[31m-            }[m
[31m-          ][m
[31m-        });[m
[31m-      }[m
[31m-    }[m
[31m-  }[m
[31m-[m
   onNavbarToggled() {[m
     this.isOpen = !this.isOpen;[m
   }[m
 [m
[31m-  ngOnDestroy() {[m
[31m-    this.destroy$.next();[m
[31m-    this.destroy$.complete();[m
[31m-  }[m
[31m-[m
   disconnect() {[m
     this.isOpen = false;[m
     this.roleService.clearRole();[m
[36m@@ -148,26 +74,4 @@[m [mexport class NavigationBar implements OnDestroy {[m
   isLoginPage(): boolean {[m
     return this.router.url === '/login';[m
   }[m
[31m-[m
[31m-  isActivePage(route: string): boolean {[m
[31m-    const currentUrl = this.router.url.split('?')[0]; // Enlever les query params[m
[31m-    [m
[31m-    // Si c'est la route racine[m
[31m-    if (route === '/') {[m
[31m-      return currentUrl === '/' || currentUrl === '';[m
[31m-    }[m
[31m-    [m
[31m-    // Vérifier si c'est une correspondance exacte[m
[31m-    if (currentUrl === route) {[m
[31m-      return true;[m
[31m-    }[m
[31m-    [m
[31m-    // Pour /photographers, vérifier que l'URL est exactement /photographers (pas de sous-routes)[m
[31m-    if (route === '/photographers') {[m
[31m-      return currentUrl === '/photographers';[m
[31m-    }[m
[31m-    [m
[31m-    // Pour les autres routes avec sous-chemins, vérifier correspondance exacte[m
[31m-    return currentUrl === route;[m
[31m-  }[m
 }[m
[1mdiff --git a/boardpxl-frontend/src/app/photographer-card/photographer-card.html b/boardpxl-frontend/src/app/photographer-card/photographer-card.html[m
[1mindex 730a7ad..a990e20 100644[m
[1m--- a/boardpxl-frontend/src/app/photographer-card/photographer-card.html[m
[1m+++ b/boardpxl-frontend/src/app/photographer-card/photographer-card.html[m
[36m@@ -1,9 +1,7 @@[m
 <div class="card">[m
     <div>[m
[31m-        <a [routerLink]="['/photographer', photographer.id]" [m
[31m-           [queryParams]="{name: photographer.name}">[m
[31m-            <p>Photographer : {{ photographer.name }}</p>[m
[31m-        </a> [m
[32m+[m[32m        <!-- routerLink a changer quand on aura la page profil -->[m
[32m+[m[32m        <a routerLink="/photographers" ><p>Photographer : {{ photographer.name }}</p></a>[m[41m [m
         <p *ngIf="photographer.email">Email : {{ photographer.email }}</p>[m
         <p *ngIf="!photographer.email">Pas d'email</p>[m
     </div>[m
[1mdiff --git a/boardpxl-frontend/src/app/photographer-card/photographer-card.scss b/boardpxl-frontend/src/app/photographer-card/photographer-card.scss[m
[1mindex bb305c9..cbbb3a9 100644[m
[1m--- a/boardpxl-frontend/src/app/photographer-card/photographer-card.scss[m
[1m+++ b/boardpxl-frontend/src/app/photographer-card/photographer-card.scss[m
[36m@@ -19,22 +19,6 @@[m
         align-items: center;[m
         text-align: center;[m
     }[m
[31m-[m
[31m-    a {[m
[31m-        text-decoration: none;[m
[31m-        color: #000000;[m
[31m-        cursor: pointer;[m
[31m-        transition: color 0.2s;[m
[31m-[m
[31m-        &:hover {[m
[31m-            color: #0056b3;[m
[31m-            text-decoration: underline;[m
[31m-        }[m
[31m-[m
[31m-        p {[m
[31m-            margin: 0;[m
[31m-        }[m
[31m-    }[m
 }[m
 [m
 .status {[m
[1mdiff --git a/boardpxl-frontend/src/app/photographer-request/photographer-request.ts b/boardpxl-frontend/src/app/photographer-request/photographer-request.ts[m
[1mindex 5b173db..ebe6d2b 100644[m
[1m--- a/boardpxl-frontend/src/app/photographer-request/photographer-request.ts[m
[1m+++ b/boardpxl-frontend/src/app/photographer-request/photographer-request.ts[m
[36m@@ -129,30 +129,21 @@[m [mCordialement,[m
     let to = 'boardpxl@placeholder.com'; // remplacer par l'email de SportPXL[m
     let from = this.authService.getUser()?.email || ''; // remplacer par l'email du photographe connecté[m
     let subject = `[BoardPXL]`;[m
[31m-    let type = '';[m
     if (this.requestType === 'versement') {[m
       subject += ' Demande de versement de chiffre d\'affaires';[m
[31m-      type = 'versement';[m
     } else if (this.requestType === 'crédits') {[m
       subject += ' Demande d\'ajout de crédits';[m
[31m-      type = 'crédits';[m
     }[m
 [m
     this.isSending = true;[m
[31m-    this.mailService.sendMail(to, from, subject, body, type).subscribe({[m
[32m+[m[32m    this.mailService.sendMail(to, from, subject, body).subscribe({[m
       next: (response) => {[m
[31m-        console.log('Mail envoyé avec succès:', response);[m
         this.isSending = false;[m
         window.location.assign('/request/success');[m
       },[m
       error: (error) => {[m
[31m-        console.error('Erreur lors de l\'envoi du mail:', error);[m
[31m-        console.error('Détails de l\'erreur:', error.error);[m
         this.isSending = false;[m
[31m-        // Attendre 3 secondes avant de rediriger pour que l'utilisateur voie le message[m
[31m-        setTimeout(() => {[m
[31m-          window.location.assign('/request/failure');[m
[31m-        }, 3000);[m
[32m+[m[32m        window.location.assign('/request/failure');[m
       }[m
     });[m
 [m
[1mdiff --git a/boardpxl-frontend/src/app/profile-information/profile-information.html b/boardpxl-frontend/src/app/profile-information/profile-information.html[m
[1mdeleted file mode 100644[m
[1mindex f2961e3..0000000[m
[1m--- a/boardpxl-frontend/src/app/profile-information/profile-information.html[m
[1m+++ /dev/null[m
[36m@@ -1,91 +0,0 @@[m
[31m-<section class="profile">[m
[31m-  <app-title [title]="name" [icon]="''"></app-title>[m
[31m-  <div class="loading-overlay" *ngIf="isLoading">[m
[31m-    <div class="spinner"></div>[m
[31m-    <p>Chargement du profil...</p>[m
[31m-  </div>[m
[31m-  <div class="profile_layout" *ngIf="!isLoading">[m
[31m-    <section class="card info-card">[m
[31m-      <h2 class="card_title">Informations générales</h2>[m
[31m-      <div class="info-card_content">[m
[31m-        <div class="identity">[m
[31m-          <div class="identity_name">{{ family_name || name }} {{ given_name }}</div>[m
[31m-          <div class="identity_email" *ngIf="email">{{ email }}</div>[m
[31m-        </div>[m
[31m-        <div class="info-row">[m
[31m-          <span class="info-row_label">Nom</span>[m
[31m-          <span class="info-row_value">{{ family_name || name }}</span>[m
[31m-        </div>[m
[31m-        <div class="info-row">[m
[31m-          <span class="info-row_label">Prénom</span>[m
[31m-          <span class="info-row_value">{{ given_name }}</span>[m
[31m-        </div>[m
[31m-        <div class="info-row">[m
[31m-          <span class="info-row_label">email</span>[m
[31m-          <span class="info-row_value">{{ email }}</span>[m
[31m-        </div>[m
[31m-        <div class="info-row">[m
[31m-          <span class="info-row_label">Nombre de ventes totales</span>[m
[31m-          <span class="info-row_value">{{ numberSell || '—' }} ventes</span>[m
[31m-        </div>[m
[31m-[m
[31m-        <div class="address-card">[m
[31m-          <div class="address-card_item">[m
[31m-            <span class="info-row_label">Adresse</span>[m
[31m-            <span class="info-row_value">{{ street_address }}</span>[m
[31m-          </div>[m
[31m-          <div class="address-card_item">[m
[31m-            <span class="info-row_label">Ville</span>[m
[31m-            <span class="info-row_value">{{ locality }}</span>[m
[31m-          </div>[m
[31m-          <div class="address-card_item">[m
[31m-            <span class="info-row_label">Code postal</span>[m
[31m-            <span class="info-row_value">{{ postal_code }}</span>[m
[31m-          </div>[m
[31m-          <div class="address-card_item">[m
[31m-            <span class="info-row_label">Pays</span>[m
[31m-            <span class="info-row_value">{{ country }}</span>[m
[31m-          </div>[m
[31m-        </div>[m
[31m-      </div>[m
[31m-    </section>[m
[31m-[m
[31m-    <section class="card metrics-card">[m
[31m-      <div class="metrics">[m
[31m-        <div class="metric metric--turnover">[m
[31m-          <div class="metric_label">Chiffre d'affaire</div>[m
[31m-          <div class="metric_value">{{ turnover }} €</div>[m
[31m-        </div>[m
[31m-        <div class="metric metric--credits">[m
[31m-          <div class="metric_label">Crédits restants</div>[m
[31m-          <div class="metric_value">{{ remainingCredits }}</div>[m
[31m-        </div>[m
[31m-      </div>[m
[31m-[m
[31m-      <div class="chart-card">[m
[31m-        <div class="chart-card_header">[m
[31m-          <div class="chart-card_title">Filtres</div>[m
[31m-          <button class="chart-card_toggle" type="button" aria-label="Ouvrir les filtres">[m
[31m-            <span></span>[m
[31m-            <span></span>[m
[31m-            <span></span>[m
[31m-          </button>[m
[31m-        </div>[m
[31m-        <div class="chips">[m
[31m-          <button class="chip" type="button">[m
[31m-            <span class="chip_close">×</span>[m
[31m-            <span>Chiffre d'affaire</span>[m
[31m-          </button>[m
[31m-          <button class="chip" type="button">[m
[31m-            <span class="chip_close">×</span>[m
[31m-            <span>Total crédit</span>[m
[31m-          </button>[m
[31m-        </div>[m
[31m-        <div class="chart-placeholder" aria-hidden="true">[m
[31m-          <div class="chart-placeholder_grid"></div>[m
[31m-          <div class="chart-placeholder_lines"></div>[m
[31m-        </div>[m
[31m-      </div>[m
[31m-    </section>[m
[31m-  </div>[m
[31m-</section>[m
[1mdiff --git a/boardpxl-frontend/src/app/profile-information/profile-information.scss b/boardpxl-frontend/src/app/profile-information/profile-information.scss[m
[1mdeleted file mode 100644[m
[1mindex 0749a4e..0000000[m
[1m--- a/boardpxl-frontend/src/app/profile-information/profile-information.scss[m
[1m+++ /dev/null[m
[36m@@ -1,285 +0,0 @@[m
[31m-@use "sass:color";[m
[31m-[m
[31m-:host {[m
[31m-  display: block;[m
[31m-  color: #181818;[m
[31m-  font-family: "Poppins", "Segoe UI", sans-serif;[m
[31m-}[m
[31m-[m
[31m-.profile {[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  gap: 20px;[m
[31m-  margin: 13px 13px 0px 13px;[m
[31m-  position: relative;[m
[31m-}[m
[31m-[m
[31m-.loading-overlay {[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  align-items: center;[m
[31m-  justify-content: center;[m
[31m-  padding: 3rem 2rem;[m
[31m-  background: white;[m
[31m-  border-radius: 10px;[m
[31m-[m
[31m-  .spinner {[m
[31m-    width: 40px;[m
[31m-    height: 40px;[m
[31m-    border: 4px solid #f0f0f0;[m
[31m-    border-top: 4px solid #FF6B35;[m
[31m-    border-radius: 50%;[m
[31m-    animation: spin 1s linear infinite;[m
[31m-    margin-bottom: 1rem;[m
[31m-  }[m
[31m-[m
[31m-  p {[m
[31m-    color: #666;[m
[31m-    font-size: 0.95rem;[m
[31m-  }[m
[31m-}[m
[31m-[m
[31m-@keyframes spin {[m
[31m-  0% { transform: rotate(0deg); }[m
[31m-  100% { transform: rotate(360deg); }[m
[31m-}[m
[31m-[m
[31m-.profile_layout {[m
[31m-  display: grid;[m
[31m-  grid-template-columns: 1.2fr 1fr;[m
[31m-  gap: 22px;[m
[31m-}[m
[31m-[m
[31m-.card {[m
[31m-  background: #fff;[m
[31m-  border: 2px solid #f1f1f1;[m
[31m-  border-radius: 12px;[m
[31m-  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);[m
[31m-  padding: 18px 20px 20px;[m
[31m-}[m
[31m-[m
[31m-.card_title {[m
[31m-  margin: 0 0 12px;[m
[31m-  font-size: 20px;[m
[31m-  font-weight: 700;[m
[31m-  color: #1f1f1f;[m
[31m-}[m
[31m-[m
[31m-.info-card_content {[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  gap: 14px;[m
[31m-}[m
[31m-[m
[31m-.identity {[m
[31m-  padding: 10px 12px;[m
[31m-  border: 2px solid #f1f1f1;[m
[31m-  border-radius: 10px;[m
[31m-  background: #fff8f2;[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  gap: 6px;[m
[31m-}[m
[31m-[m
[31m-.identity_name {[m
[31m-  font-size: 18px;[m
[31m-  font-weight: 700;[m
[31m-  color: #1f1f1f;[m
[31m-}[m
[31m-[m
[31m-.identity_email {[m
[31m-  font-size: 14px;[m
[31m-  color: #555;[m
[31m-  word-break: break-word;[m
[31m-}[m
[31m-[m
[31m-.info-row {[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  gap: 4px;[m
[31m-}[m
[31m-[m
[31m-.info-row_label {[m
[31m-  font-size: 12px;[m
[31m-  text-transform: uppercase;[m
[31m-  letter-spacing: 0.5px;[m
[31m-  color: #5f5f5f;[m
[31m-}[m
[31m-[m
[31m-.info-row_value {[m
[31m-  font-size: 16px;[m
[31m-  font-weight: 500;[m
[31m-  color: #1f1f1f;[m
[31m-}[m
[31m-[m
[31m-.address-card {[m
[31m-  margin-top: 10px;[m
[31m-  border: 2px solid #f1f1f1;[m
[31m-  border-radius: 10px;[m
[31m-  padding: 12px;[m
[31m-  display: grid;[m
[31m-  grid-template-columns: repeat(2, minmax(0, 1fr));[m
[31m-  gap: 12px;[m
[31m-}[m
[31m-[m
[31m-.address-card_item {[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  gap: 4px;[m
[31m-}[m
[31m-[m
[31m-.metrics-card {[m
[31m-  display: grid;[m
[31m-  grid-template-rows: auto 1fr;[m
[31m-  gap: 16px;[m
[31m-}[m
[31m-[m
[31m-.metrics {[m
[31m-  display: grid;[m
[31m-  grid-template-columns: repeat(2, minmax(0, 1fr));[m
[31m-  gap: 12px;[m
[31m-}[m
[31m-[m
[31m-.metric {[m
[31m-  background: #f98524;[m
[31m-  color: #fff;[m
[31m-  border-radius: 12px;[m
[31m-  padding: 12px 14px;[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  gap: 6px;[m
[31m-  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);[m
[31m-}[m
[31m-[m
[31m-.metric--credits {[m
[31m-  background: #ef6c00;[m
[31m-}[m
[31m-[m
[31m-.metric_label {[m
[31m-  font-size: 14px;[m
[31m-  font-weight: 600;[m
[31m-}[m
[31m-[m
[31m-.metric_value {[m
[31m-  font-size: 26px;[m
[31m-  font-weight: 700;[m
[31m-}[m
[31m-[m
[31m-.chart-card {[m
[31m-  border: 2px solid #f1f1f1;[m
[31m-  border-radius: 12px;[m
[31m-  padding: 14px 14px 16px;[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  gap: 12px;[m
[31m-}[m
[31m-[m
[31m-.chart-card_header {[m
[31m-  display: flex;[m
[31m-  align-items: center;[m
[31m-  justify-content: space-between;[m
[31m-}[m
[31m-[m
[31m-.chart-card_title {[m
[31m-  font-size: 16px;[m
[31m-  font-weight: 600;[m
[31m-  color: #1f1f1f;[m
[31m-}[m
[31m-[m
[31m-.chart-card_toggle {[m
[31m-  width: 32px;[m
[31m-  height: 32px;[m
[31m-  border: 2px solid #1f1f1f;[m
[31m-  border-radius: 6px;[m
[31m-  background: transparent;[m
[31m-  display: flex;[m
[31m-  flex-direction: column;[m
[31m-  justify-content: center;[m
[31m-  gap: 4px;[m
[31m-  padding: 4px;[m
[31m-}[m
[31m-[m
[31m-.chart-card_toggle span {[m
[31m-  display: block;[m
[31m-  height: 2px;[m
[31m-  background: #1f1f1f;[m
[31m-}[m
[31m-[m
[31m-.chips {[m
[31m-  display: flex;[m
[31m-  gap: 8px;[m
[31m-  flex-wrap: wrap;[m
[31m-}[m
[31m-[m
[31m-.chip {[m
[31m-  border: 1px solid #d4d4d4;[m
[31m-  border-radius: 999px;[m
[31m-  background: #f7f7f7;[m
[31m-  padding: 6px 10px;[m
[31m-  display: inline-flex;[m
[31m-  align-items: center;[m
[31m-  gap: 6px;[m
[31m-  font-size: 13px;[m
[31m-}[m
[31m-[m
[31m-.chip_close {[m
[31m-  font-size: 14px;[m
[31m-  line-height: 1;[m
[31m-}[m
[31m-[m
[31m-.chart-placeholder {[m
[31m-  position: relative;[m
[31m-  height: 260px;[m
[31m-  border-radius: 10px;[m
[31m-  overflow: hidden;[m
[31m-  background: linear-gradient(180deg, #fdfdfd 0%, #f6f6f6 100%);[m
[31m-  border: 1px solid #ededed;[m
[31m-}[m
[31m-[m
[31m-.chart-placeholder_grid {[m
[31m-  position: absolute;[m
[31m-  inset: 0;[m
[31m-  background-image:[m
[31m-    linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),[m
[31m-    linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px);[m
[31m-  background-size: 60px 60px;[m
[31m-}[m
[31m-[m
[31m-.chart-placeholder_lines {[m
[31m-  position: absolute;[m
[31m-  inset: 0;[m
[31m-  background-image:[m
[31m-    radial-gradient(circle at 10% 40%, rgba(71, 147, 220, 0.35) 1px, transparent 0),[m
[31m-    radial-gradient(circle at 30% 70%, rgba(26, 179, 148, 0.4) 1px, transparent 0),[m
[31m-    radial-gradient(circle at 50% 30%, rgba(233, 94, 112, 0.4) 1px, transparent 0),[m
[31m-    radial-gradient(circle at 70% 60%, rgba(248, 133, 36, 0.35) 1px, transparent 0),[m
[31m-    radial-gradient(circle at 90% 45%, rgba(71, 147, 220, 0.35) 1px, transparent 0);[m
[31m-  background-size: 120px 120px;[m
[31m-  mix-blend-mode: multiply;[m
[31m-}[m
[31m-[m
[31m-@media (max-width: 1024px) {[m
[31m-  .profile_layout {[m
[31m-    grid-template-columns: 1fr;[m
[31m-  }[m
[31m-[m
[31m-  .metrics {[m
[31m-    grid-template-columns: 1fr;[m
[31m-  }[m
[31m-}[m
[31m-[m
[31m-@media (max-width: 640px) {[m
[31m-  .profile_hero {[m
[31m-    grid-template-columns: 1fr;[m
[31m-    text-align: center;[m
[31m-    gap: 8px;[m
[31m-  }[m
[31m-[m
[31m-  .profile_hero-icon {[m
[31m-    justify-content: center;[m
[31m-  }[m
[31m-[m
[31m-  .address-card {[m
[31m-    grid-template-columns: 1fr;[m
[31m-  }[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/profile-information/profile-information.spec.ts b/boardpxl-frontend/src/app/profile-information/profile-information.spec.ts[m
[1mdeleted file mode 100644[m
[1mindex e69de29..0000000[m
[1mdiff --git a/boardpxl-frontend/src/app/profile-information/profile-information.ts b/boardpxl-frontend/src/app/profile-information/profile-information.ts[m
[1mdeleted file mode 100644[m
[1mindex fcd9b8d..0000000[m
[1m--- a/boardpxl-frontend/src/app/profile-information/profile-information.ts[m
[1m+++ /dev/null[m
[36m@@ -1,109 +0,0 @@[m
[31m-import { Component, Input } from '@angular/core';[m
[31m-import { ActivatedRoute } from '@angular/router';[m
[31m-import { ClientService } from '../services/client-service.service';[m
[31m-import { InvoiceService } from '../services/invoice-service';[m
[31m-import { InvoicePayment } from '../models/invoice-payment.model';[m
[31m-import { App } from '../app';[m
[31m-[m
[31m-const app = new App();[m
[31m-@Component({[m
[31m-  selector: 'app-profile-information',[m
[31m-  standalone: false,[m
[31m-  templateUrl: './profile-information.html',[m
[31m-  styleUrl: './profile-information.scss',[m
[31m-})[m
[31m-[m
[31m-export class ProfileInformation[m
[31m-{[m
[31m-  protected remainingCredits: number = 0;[m
[31m-  protected turnover: number = 0;[m
[31m-  protected name: string = '';[m
[31m-  protected family_name: string = '';[m
[31m-  protected given_name: string = '';[m
[31m-  protected email: string = '';[m
[31m-  protected street_address: string = '';[m
[31m-  protected locality: string = '';[m
[31m-  protected postal_code: string = '';[m
[31m-  protected country: string = '';[m
[31m-  protected numberSell: number = 0;[m
[31m-  protected isLoading: boolean = true;[m
[31m-  findPhotographer: boolean = false;[m
[31m-  photographerId: string | null = null;[m
[31m-[m
[31m-  constructor([m
[31m-    private clientService: ClientService,[m
[31m-    private invoiceService: InvoiceService,[m
[31m-    private route: ActivatedRoute,[m
[31m-  ) {}[m
[31m-[m
[31m-  ngOnInit()[m
[31m-  {[m
[31m-    this.photographerId = this.route.snapshot.paramMap.get('id')[m
[31m-[m
[31m-    if (!this.photographerId)[m
[31m-    {[m
[31m-      this.findPhotographer = false;[m
[31m-      return;[m
[31m-    }[m
[31m-[m
[31m-    this.clientService.getPhotographer(this.photographerId).subscribe([m
[31m-      {[m
[31m-        next: (data) => {[m
[31m-          if (data && data.email)[m
[31m-          {[m
[31m-            this.findPhotographer = true;[m
[31m-            this.email = data.email;[m
[31m-            this.family_name = data.family_name;[m
[31m-            this.given_name = data.given_name;[m
[31m-            this.name = data.name;[m
[31m-            this.remainingCredits = data.total_limit - data.nb_imported_photos;[m
[31m-            this.street_address = data.street_address;[m
[31m-            this.postal_code = data.postal_code;[m
[31m-            this.locality = data.locality;[m
[31m-            this.country = data.country;[m
[31m-            this.loadTurnover();[m
[31m-            this.isLoading = false;[m
[31m-          }[m
[31m-          else[m
[31m-          {[m
[31m-            this.findPhotographer = false;[m
[31m-            this.isLoading = false;[m
[31m-          }[m
[31m-        },[m
[31m-        error: (err) => {[m
[31m-          console.error('Error fetch photographer :', err);[m
[31m-          this.findPhotographer = false;[m
[31m-          this.isLoading = false;[m
[31m-        }[m
[31m-      }[m
[31m-    )[m
[31m-  }[m
[31m-[m
[31m-  private loadTurnover()[m
[31m-  {[m
[31m-    if (!this.findPhotographer || !this.name)[m
[31m-    {[m
[31m-      return;[m
[31m-    }[m
[31m-[m
[31m-    const body = { name: this.name };[m
[31m-    this.clientService.getClientIdByName(body).subscribe({[m
[31m-      next: (data) =>[m
[31m-      {[m
[31m-        if (data && data.client_id)[m
[31m-        {[m
[31m-          this.invoiceService.getInvoicesByClient(data.client_id).subscribe(invoices => {[m
[31m-            const invoicesTemp = invoices;[m
[31m-            this.turnover = 0;[m
[31m-            for (const invoice of invoicesTemp) {[m
[31m-              if (invoice instanceof InvoicePayment)[m
[31m-              {[m
[31m-                this.turnover += invoice.turnover;[m
[31m-              }[m
[31m-            }[m
[31m-          })[m
[31m-        }[m
[31m-      }[m
[31m-    })[m
[31m-  }[m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/search-bar/search-bar.html b/boardpxl-frontend/src/app/search-bar/search-bar.html[m
[1mindex 0a2016f..2dee0dd 100644[m
[1m--- a/boardpxl-frontend/src/app/search-bar/search-bar.html[m
[1m+++ b/boardpxl-frontend/src/app/search-bar/search-bar.html[m
[36m@@ -1,4 +1,4 @@[m
 <div>[m
[31m-    <input type="text" [placeholder]="placeholder" [value]="query" (input)="query = $event.target.value" (keydown.enter)="onQueryChange(query)">[m
[32m+[m[32m    <input type="text" placeholder="Rechercher un photographe..." [value]="query" (input)="query = $event.target.value" (keydown.enter)="onQueryChange(query)">[m
     <button (click)="onQueryChange(query)"><span class="material-symbols-outlined">search</span></button>[m
 </div>[m
[1mdiff --git a/boardpxl-frontend/src/app/search-bar/search-bar.ts b/boardpxl-frontend/src/app/search-bar/search-bar.ts[m
[1mindex 01e0a59..eca07f4 100644[m
[1m--- a/boardpxl-frontend/src/app/search-bar/search-bar.ts[m
[1m+++ b/boardpxl-frontend/src/app/search-bar/search-bar.ts[m
[36m@@ -8,7 +8,6 @@[m [mimport { Input, Output, EventEmitter } from '@angular/core';[m
   styleUrl: './search-bar.scss',[m
 })[m
 export class SearchBar {[m
[31m-  @Input() placeholder: string = 'Rechercher un photographe...';[m
   @Output() filter = new EventEmitter<string>();[m
 [m
   query = '';[m
[1mdiff --git a/boardpxl-frontend/src/app/services/client-service.service.ts b/boardpxl-frontend/src/app/services/client-service.service.ts[m
[1mindex 5219ffb..419e70f 100644[m
[1m--- a/boardpxl-frontend/src/app/services/client-service.service.ts[m
[1m+++ b/boardpxl-frontend/src/app/services/client-service.service.ts[m
[36m@@ -17,8 +17,4 @@[m [mexport class ClientService {[m
   getClients(): Observable<any> {[m
     return this.http.get(`${environment.apiUrl}/list-clients`, this.headersService.getAuthHeaders());[m
   }[m
[31m-[m
[31m-  getPhotographer(id: string|null): Observable<any> {[m
[31m-    return this.http.get(`${environment.apiUrl}/photographer/${id}`, this.headersService.getAuthHeaders());[m
[31m-  }[m
 }[m
[1mdiff --git a/boardpxl-frontend/src/app/services/invoice-service.ts b/boardpxl-frontend/src/app/services/invoice-service.ts[m
[1mindex c9899d0..e5db80c 100644[m
[1m--- a/boardpxl-frontend/src/app/services/invoice-service.ts[m
[1m+++ b/boardpxl-frontend/src/app/services/invoice-service.ts[m
[36m@@ -11,41 +11,91 @@[m [mimport { HttpHeadersService } from './http-headers.service';[m
 })[m
 export class InvoiceService {[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   *[m
[32m+[m[32m   *[m
[32m+[m[32m   *[m
[32m+[m[32m   * */[m
   constructor(private http: HttpClient, private headersService: HttpHeadersService) {[m
   }[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   * Get all invoices from a specific client[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param string clientId[m
[32m+[m[32m   * @return Observable<Invoice[]>[m
[32m+[m[32m   * */[m
   getInvoicesByClient(clientId: string): Observable<Invoice[]> {[m
     return this.http.get<Invoice[]>(`${environment.apiUrl}/invoices-client/${clientId}`, this.headersService.getAuthHeaders());[m
   }[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   *[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param Invoice invoice[m
[32m+[m[32m   * @return Observable<string[]>[m
[32m+[m[32m   * */[m
   getProductFromInvoice(invoice: Invoice): Observable<string[]> {[m
     return this.http.get<string[]>(`${environment.apiUrl}/invoice-product/${invoice.invoice_number}`, this.headersService.getAuthHeaders());[m
   }[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   * Call the api to get all payment invoices from a specific photographer[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param number photographerId[m
[32m+[m[32m   * @return Observable<InvoicePayment[]>[m
[32m+[m[32m   * */[m
   getInvoicesPaymentByPhotographer(photographerId: number): Observable<InvoicePayment[]> {[m
     return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-payment/${photographerId}`, this.headersService.getAuthHeaders());[m
   }[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   * Call the api to get all credit invoices from a specific photographer[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param number photographerId[m
[32m+[m[32m   * @return Observable<InvoicePayment[]>[m
[32m+[m[32m   * */[m
   getInvoicesCreditByPhotographer(photographerId: number): Observable<InvoicePayment[]> {[m
     return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-credit/${photographerId}`, this.headersService.getAuthHeaders());[m
   }[m
 [m
[31m-  [m
[32m+[m[32m  /**[m
[32m+[m[32m   * Call the api to create a new credit invoice for a photographer[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param any body[m
[32m+[m[32m   * @return Observable<any>[m
[32m+[m[32m   * */[m
   createCreditsInvoice(body: any): Observable<any> {[m
     return this.http.post(`${environment.apiUrl}/create-credits-invoice-client`, body, this.headersService.getAuthHeaders());[m
   }[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   * Call the api to create a new payment invoice for a photographer[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param any body[m
[32m+[m[32m   * @return Observable<any>[m
[32m+[m[32m   * */[m
   createTurnoverPaymentInvoice(body: any): Observable<any> {[m
     return this.http.post(`${environment.apiUrl}/create-turnover-invoice-client`, body, this.headersService.getAuthHeaders());[m
   }[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   * Call the api to insert a new payment invoice for a photographer[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param any body[m
[32m+[m[32m   * @return Observable<any>[m
[32m+[m[32m   * */[m
   insertTurnoverInvoice(body: any): Observable<any> {[m
     return this.http.post(`${environment.apiUrl}/insert-turnover-invoice`, body, this.headersService.getAuthHeaders());[m
   }[m
 [m
[32m+[m[32m  /**[m
[32m+[m[32m   * Call the api to insert a new credit invoice for a photographer[m
[32m+[m[32m   *[m
[32m+[m[32m   * @param any body[m
[32m+[m[32m   * @return Observable<any>[m
[32m+[m[32m   * */[m
   insertCreditsInvoice(body: any): Observable<any> {[m
     return this.http.post(`${environment.apiUrl}/insert-credits-invoice`, body, this.headersService.getAuthHeaders());[m
   }[m
[31m-[m
[31m-  [m
 }[m
[1mdiff --git a/boardpxl-frontend/src/app/services/logs-service.spec.ts b/boardpxl-frontend/src/app/services/logs-service.spec.ts[m
[1mdeleted file mode 100644[m
[1mindex 504f97d..0000000[m
[1m--- a/boardpxl-frontend/src/app/services/logs-service.spec.ts[m
[1m+++ /dev/null[m
[36m@@ -1,16 +0,0 @@[m
[31m-import { TestBed } from '@angular/core/testing';[m
[31m-[m
[31m-import { LogsService } from './logs-service';[m
[31m-[m
[31m-describe('LogsService', () => {[m
[31m-  let service: LogsService;[m
[31m-[m
[31m-  beforeEach(() => {[m
[31m-    TestBed.configureTestingModule({});[m
[31m-    service = TestBed.inject(LogsService);[m
[31m-  });[m
[31m-[m
[31m-  it('should be created', () => {[m
[31m-    expect(service).toBeTruthy();[m
[31m-  });[m
[31m-});[m
[1mdiff --git a/boardpxl-frontend/src/app/services/logs-service.ts b/boardpxl-frontend/src/app/services/logs-service.ts[m
[1mdeleted file mode 100644[m
[1mindex c33f4b6..0000000[m
[1m--- a/boardpxl-frontend/src/app/services/logs-service.ts[m
[1m+++ /dev/null[m
[36m@@ -1,9 +0,0 @@[m
[31m-import { Injectable } from '@angular/core';[m
[31m-[m
[31m-[m
[31m-@Injectable({[m
[31m-  providedIn: 'root',[m
[31m-})[m
[31m-export class LogsService {[m
[31m-  [m
[31m-}[m
[1mdiff --git a/boardpxl-frontend/src/app/services/mail-service.ts b/boardpxl-frontend/src/app/services/mail-service.ts[m
[1mindex bdb0097..7033dfa 100644[m
[1m--- a/boardpxl-frontend/src/app/services/mail-service.ts[m
[1m+++ b/boardpxl-frontend/src/app/services/mail-service.ts[m
[36m@@ -3,7 +3,6 @@[m [mimport { HttpClient } from '@angular/common/http';[m
 import { Observable } from 'rxjs';[m
 import { environment } from '../../environments/environment.development';[m
 import { HttpHeadersService } from './http-headers.service';[m
[31m-import { Mail } from '../models/mail.model';[m
 [m
 @Injectable({[m
   providedIn: 'root',[m
[36m@@ -13,19 +12,13 @@[m [mexport class MailService {[m
   constructor(private http: HttpClient, private headersService: HttpHeadersService) {[m
   }[m
 [m
[31m-  sendMail(to: string, from: string, subject: string, body: string, type: string): Observable<any> {[m
[32m+[m[32m  sendMail(to: string, from: string, subject: string, body: string): Observable<any> {[m
     const payload = {[m
       to: to,[m
       from: from,[m
       subject: subject,[m
       body: body,[m
[31m-      type: type[m
     };[m
[31m-    console.log('Tentative d\'envoi de mail:', payload);[m
     return this.http.post(`${environment.apiUrl}/send-email`, payload, this.headersService.getAuthHeaders());[m
   }[m
[31m-[m
[31m-  getMailLogs(sender_id: number): Observable<Mail[]> {[m
[31m-    return this.http.get<Mail[]>(`${environment.apiUrl}/mail-logs/${sender_id}`, this.headersService.getAuthHeaders());[m
[31m-  }[m
 }[m
\ No newline at end of file[m
