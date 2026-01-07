<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Photographer;

class PhotographerController extends Controller
{
    public function getPhotographerByEmail($email)
    {
        $photographer = Photographer::findProfilData($email);

        if (!$photographer)
        {
            return response()->json(['message' => 'Photographe non trouvé'], 404);
        }

        return response()->json($photographer);
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
}
