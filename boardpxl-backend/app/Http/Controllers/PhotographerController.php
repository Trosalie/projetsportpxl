<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Photographer;

class PhotographerController extends Controller
{
    public function getPhotographerById($idClient)
    {
        $photographer = Photographer::find($idClient);

        if (!$photographer)
        {
            return response()->json(['message' => 'Photographe non trouvé'], 404);
        }

        return response()->json($photographer);
    }
}
