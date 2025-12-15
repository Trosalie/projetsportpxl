<?php

namespace Tests\Unit;

use App\Models\Photographer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\TestCase;
use Database\Factories\PhotographerFactory;
use Illuminate\Support\Facades\Hash;


class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_user_can_login_with_valid_credentials()
    {
        // GIVEN
        $photographer = Photographer::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        // WHEN
        $response = $this->post('/login', [
            'email' => $photographer->email,
            'password' => 'password123',
        ]);

        // THEN
        $response->assertRedirect('/home');
        $this->assertAuthenticatedAs($photographer);
    }

    /** @test */
    public function a_user_cannot_login_with_invalid_password()
    {
        // GIVEN
        $photographer = Photographer::factory()->create([
            'password' => bcrypt('secret123'),
        ]);

        // WHEN
        $response = $this->post('/login', [
            'email' => $photographer->email,
            'password' => 'wrongpass',
        ]);

        // THEN
        $response->assertSessionHasErrors();
        $this->assertGuest();
    }
}
