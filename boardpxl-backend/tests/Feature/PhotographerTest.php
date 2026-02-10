<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Photographer;
use Illuminate\Support\Facades\Hash;

class PhotographerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test que le modèle Photographer existe
     */
    public function test_photographer_model_exists(): void
    {
        $this->assertInstanceOf(Photographer::class, new Photographer());
    }

    /**
     * Test les attributs fillable du photographe
     */
    public function test_photographer_fillable_attributes(): void
    {
        $photographer = new Photographer();
        
        $this->assertNotEmpty($photographer->getFillable());
        $this->assertContains('email', $photographer->getFillable());
        $this->assertContains('name', $photographer->getFillable());
    }

    /**
     * Test le nom de la table du photographe
     */
    public function test_photographer_table_name(): void
    {
        $photographer = new Photographer();
        $this->assertEquals('photographers', $photographer->getTable());
    }

    /**
     * Test que le modèle support les notifications
     */
    public function test_photographer_has_notifiable_trait(): void
    {
        $photographer = new Photographer();
        
        $this->assertTrue(in_array('Illuminate\\Notifications\\Notifiable', class_uses($photographer)));
    }
}
