<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Exceptions\Handler;
use Throwable;
use Exception;

class ExceptionHandlerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test que le gestionnaire d'exceptions peut être instancié
     */
    public function test_exception_handler_instantiation(): void
    {
        $handler = $this->app->make(Handler::class);
        $this->assertInstanceOf(Handler::class, $handler);
    }

    /**
     * Test que le gestionnaire ne rapporte pas les exceptions dontReport
     */
    public function test_dont_report_list_is_configured(): void
    {
        $handler = $this->app->make(Handler::class);
        
        // Vérifier que la propriété dontReport existe
        $reflectionClass = new \ReflectionClass($handler);
        $property = $reflectionClass->getProperty('dontReport');
        $property->setAccessible(true);
        
        $dontReport = $property->getValue($handler);
        $this->assertIsArray($dontReport);
    }

    /**
     * Test que le gestionnaire a une liste de flash data dontFlash
     */
    public function test_dont_flash_list_is_configured(): void
    {
        $handler = $this->app->make(Handler::class);
        
        // Vérifier que la propriété dontFlash existe et contient les champs sensibles
        $reflectionClass = new \ReflectionClass($handler);
        $property = $reflectionClass->getProperty('dontFlash');
        $property->setAccessible(true);
        
        $dontFlash = $property->getValue($handler);
        $this->assertIsArray($dontFlash);
        $this->assertContains('password', $dontFlash);
    }
}
