<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PhotographerController extends Controller
{
    public function getPhotographers()
    {
        $photographers = DB::table('photographers')->get();
        return response()->json($photographers);
    }

    public function getPhotographerId($name)
    {   
        if (!$name) {
            return response()->json(['error' => 'Name parameter is required'], 400);
        }

        $photographer = DB::table('photographers')
            ->where('name', $name)
            ->first();
        
        if ($photographer) {
            return response()->json(['id' => $photographer->id, 'client_id' => $photographer->id]);
        } else {
            return response()->json(['error' => 'Photographer not found'], 404);
        }
    }
}
