<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class InvoiceController extends Controller
{
    public function download(Request $request)
    {
        $fileUrl = $request->input('file_url');

        if (!$fileUrl) {
            return response('Aucun fichier spécifié.', 400);
        }

        // Récupérer le contenu du PDF depuis Pennylane
        $fileContent = Http::get($fileUrl)->body(); // utilise HTTP client de Laravel

        // Déterminer le nom du fichier
        $fileName = 'facture.pdf';

        // Retourner le fichier en réponse avec les headers
        return response($fileContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
    }
}
