<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PhotographerController extends Controller
{
    public function getPhotographers()
    {
        $photographers = DB::table('photographers')->get();
        return response()->json($photographers);
    }

    public function getPhotographerId(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        $photographer = DB::table('photographers')
            ->where('name', $validated['name'])
            ->first();
            
        if ($photographer) {
            return response()->json(['id' => $photographer->id]);
        } else {
            return response()->json(['error' => 'Photographer not found'], 404);
        }
    }
}
