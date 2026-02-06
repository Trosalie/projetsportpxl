<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #f98524 0%, #ff7a0a 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .email-header img {
            height: 50px;
            margin-bottom: 15px;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .email-body {
            padding: 30px;
        }
        .email-body h2 {
            color: #f98524;
            font-size: 18px;
            margin-top: 0;
        }
        .email-body p {
            margin: 15px 0;
            color: #555;
        }
        .action-button {
            display: inline-block;
            background-color: #f98524;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
        }
        .action-button:hover {
            background-color: #ff7a0a;
        }
        .highlight {
            background-color: #fff3e0;
            border-left: 4px solid #f98524;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .security-note {
            background-color: #f3e5f5;
            border-left: 4px solid #9c27b0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .email-footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #888;
        }
        .emoji {
            font-size: 18px;
            margin-right: 8px;
        }
        strong {
            color: #333;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>SportPxl</h1>
            <p>Réinitialisation de votre mot de passe</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <h2>Bienvenue {{ $name }},</h2>

            <p>Vous avez demandé à réinitialiser le mot de passe de votre compte SportPxl.</p>

            <p>Pour sécuriser votre compte, cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

            <center>
                <a href="{{ $resetUrl }}" class="action-button">Réinitialiser mon mot de passe</a>
            </center>

            <div class="highlight">
                <p>
                    <span class="emoji">⏱️</span>
                    <strong>Important :</strong> Ce lien de réinitialisation est valide pendant 60 minutes seulement.
                </p>
            </div>

            <div class="security-note">
                <p>
                    <span class="emoji">🔒</span>
                    <strong>Pour votre sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre compte reste sécurisé.
                </p>
            </div>

            <p>Des questions ? Contactez notre équipe d'assistance à <strong>support@sportpxl.com</strong></p>

            <p>Cordialement,<br><strong>L'équipe SportPxl</strong></p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p>© 2026 SportPxl. Tous droits réservés.</p>
            <p>Si vous avez des difficultés avec le bouton, copiez et collez le lien dans votre navigateur :</p>
            <p><small>{{ $resetUrl }}</small></p>
        </div>
    </div>
</body>
</html>
