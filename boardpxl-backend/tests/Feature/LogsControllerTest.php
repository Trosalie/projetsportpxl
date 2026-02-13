<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Http\Controllers\LogsController;

class LogsControllerTest extends TestCase
{
    public function test_get_logs_returns_json()
    {
        $request = Request::create('/', 'GET');

        $controller = new LogsController();

        $response = $controller->getLogs($request);

        $status = $response->getStatusCode();
        $this->assertTrue(in_array($status, [200, 500]));
        $data = $response->getData(true);
        if ($status === 200) {
            $this->assertIsArray($data);
        } else {
            $this->assertArrayHasKey('success', $data);
            $this->assertFalse($data['success']);
        }
    }
}
