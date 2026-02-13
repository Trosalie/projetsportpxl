<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Http\Controllers\MailController;
use App\Services\LogService;

class MailControllerLogsTest extends TestCase
{
    public function test_get_logs_with_invalid_sender_returns_error()
    {
        $controller = new MailController(new LogService());

        // Use an ID that likely does not exist to trigger the validation/catch
        $response = $controller->getLogs(Request::create('/', 'GET'), 999999);

        $this->assertEquals(500, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertArrayHasKey('success', $data);
        $this->assertFalse($data['success']);
    }
}
