<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Photographer;
use Illuminate\Support\Facades\Http;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\Mail;
use App\Services\LogService;

class PhotographerController extends Controller
{
    private LogService $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    
    public function getPhotographer($id)
    {
        $photographer = Photographer::find($id);

        if (!$photographer)
        {
            return response()->json(['message' => 'Photographe non trouvé'], 404);
        }

        return response()->json($photographer);
    }
  
    public function getPhotographers()
    {
        try {
            $photographers = DB::table('photographers')->get();
            
            return response()->json($photographers);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getPhotographerIds($name)
    {   
        if (!$name) {
            return response()->json(['error' => 'Name parameter is required'], 400);
        }

        $photographer = DB::table('photographers')
            ->where('name', $name)
            ->first();
        
        if ($photographer) {
            return response()->json(['id' => $photographer->id, 'client_id' => $photographer->id, "pennylane_id" => $photographer->pennylane_id]);
        } else {
            return response()->json(['error' => 'Photographer not found'], 404);
        }
    }
}
