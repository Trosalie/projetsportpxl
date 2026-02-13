<?php

namespace Tests\Feature\Api;

use App\Models\Photographer;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Bind a noop LogService to avoid DB side-effects during tests
        $this->app->bind(LogService::class, function () {
            return new class extends \App\Services\LogService {
                public function logAction(\Illuminate\Http\Request $request, string $action, ?string $tableName = null, array $details = []): void { }
            };
        });
    }

    public function test_login_success_and_failure()
    {
        $password = 'secret123';
        $user = Photographer::create([
            'aws_sub' => uniqid('aws_'),
            'name' => 'Toto',
            'email' => 'toto@example.test',
            'password' => bcrypt($password),
            'fee_in_percent' => 0,
            'fix_fee' => 0,
        ]);

        // Success
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token']);

        // Failure
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(401)->assertJson(['message' => 'Invalid credentials']);
    }

    public function test_logout_and_get_user()
    {
        $user = Photographer::create([
            'aws_sub' => uniqid('aws_'),
            'name' => 'Me',
            'email' => 'me@example.test',
            'password' => bcrypt('password'),
            'fee_in_percent' => 0,
            'fix_fee' => 0,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/user')->assertStatus(200)->assertJsonFragment(['email' => $user->email]);

        $this->withSession([])->postJson('/api/logout')->assertStatus(200)->assertJson(['message' => 'Logged out successfully']);
    }

    public function test_confirm_password_success_and_failure()
    {
        $password = 'confirm123';
        $user = Photographer::create([
            'aws_sub' => uniqid('aws_'),
            'name' => 'Confirm',
            'email' => 'confirm@example.test',
            'password' => bcrypt($password),
            'fee_in_percent' => 0,
            'fix_fee' => 0,
        ]);

        Sanctum::actingAs($user);

        // Success
        $this->postJson('/api/password/confirm', ['password' => $password])->assertStatus(200)->assertJson(['message' => 'Mot de passe confirmé avec succès.']);

        // Failure
        $this->postJson('/api/password/confirm', ['password' => 'bad'])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_forgot_password_and_reset()
    {
        Notification::fake();

        $user = Photographer::create([
            'aws_sub' => uniqid('aws_'),
            'name' => 'Reset',
            'email' => 'reset@example.test',
            'password' => bcrypt('oldpassword'),
            'fee_in_percent' => 0,
            'fix_fee' => 0,
        ]);

        $this->postJson('/api/password/forgot', ['email' => $user->email])
            ->assertStatus(200)
            ->assertJson(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);

        // Create a real token for reset flow and call reset endpoint
        $token = Password::broker()->createToken($user);

        $newPassword = 'newsecurepassword';

        $this->postJson('/api/password/reset', [
            'token' => $token,
            'email' => $user->email,
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ])->assertStatus(200)->assertJson(['message' => 'Mot de passe réinitialisé avec succès.']);

        $user->refresh();
        $this->assertTrue(Hash::check($newPassword, $user->password));
    }

    // Email verification flow requires the User model to implement
    // Laravel's MustVerifyEmail contract in this project. Skipping here.
}
