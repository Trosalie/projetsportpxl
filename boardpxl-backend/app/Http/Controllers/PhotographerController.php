<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Photographer;
use Illuminate\Support\Facades\Http;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PhotographerController extends Controller
{
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
        $photographers = DB::table('photographers')->get();
        return response()->json($photographers);
    }
}
