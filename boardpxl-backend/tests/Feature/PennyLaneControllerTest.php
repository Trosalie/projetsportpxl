<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PennyLaneController;
use App\Services\PennylaneService;
use App\Services\LogService;

class PennyLaneControllerTest extends TestCase
{
    public function test_create_credits_invoice_photographer_success()
    {
        $payload = [
            'labelTVA' => 'TVA',
            'labelProduct' => 'Product',
            'description' => 'Desc',
            'amountEuro' => '100',
            'issueDate' => '2025-01-01',
            'dueDate' => '2025-01-15',
            'idPhotographer' => 42,
            'invoiceTitle' => 'Title'
        ];

        $request = Request::create('/', 'POST', $payload);

        $service = $this->getMockBuilder(PennylaneService::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['createCreditsInvoicePhotographer'])
            ->getMock();

        $service->method('createCreditsInvoicePhotographer')->willReturn(['ok' => true]);

        $controller = new PennyLaneController(new LogService());

        $response = $controller->createCreditsInvoicePhotographer($request, $service);

        $this->assertEquals(200, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertTrue($data['success']);
        $this->assertSame(['ok' => true], $data['data']);
    }

    public function test_create_turnover_payment_invoice_success()
    {
        $payload = [
            'labelTVA' => 'TVA',
            'issueDate' => '2025-01-01',
            'dueDate' => '2025-01-15',
            'idPhotographer' => 7,
            'invoiceTitle' => 'Turnover',
        ];

        $request = Request::create('/', 'POST', $payload);

        $service = $this->getMockBuilder(PennylaneService::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['createTurnoverInvoicePhotographer'])
            ->getMock();

        $service->method('createTurnoverInvoicePhotographer')->willReturn(['turnover' => true]);

        $controller = new PennyLaneController(new LogService());

        $response = $controller->createTurnoverPaymentInvoice($request, $service);

        $this->assertEquals(200, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertTrue($data['success']);
        $this->assertSame(['turnover' => true], $data['data']);
    }

    public function test_get_photographer_id_found_and_not_found()
    {
        $request = Request::create('/', 'POST', ['name' => 'Alice']);

        $service = $this->getMockBuilder(PennylaneService::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getPhotographerIdByName'])
            ->getMock();

        $service->method('getPhotographerIdByName')->willReturnOnConsecutiveCalls(123, null);

        $controller = new PennyLaneController(new LogService());

        $respFound = $controller->getPhotographerId($request, $service);
        $this->assertEquals(200, $respFound->getStatusCode());
        $dataFound = $respFound->getData(true);
        $this->assertTrue($dataFound['success']);
        $this->assertEquals(123, $dataFound['photographer_id']);

        $respNotFound = $controller->getPhotographerId($request, $service);
        $this->assertEquals(404, $respNotFound->getStatusCode());
        $dataNotFound = $respNotFound->getData(true);
        $this->assertFalse($dataNotFound['success']);
    }

    public function test_get_product_from_invoice_found_and_not_found()
    {
        $service = $this->getMockBuilder(PennylaneService::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getProductFromInvoice'])
            ->getMock();

        $service->method('getProductFromInvoice')->willReturnOnConsecutiveCalls(['product' => 'P'], null);

        $controller = new PennyLaneController(new LogService());

        $respFound = $controller->getProductFromInvoice('INV-1', $service);
        $this->assertEquals(200, $respFound->getStatusCode());
        $this->assertEquals(['product' => 'P'], $respFound->getData(true));

        $respNotFound = $controller->getProductFromInvoice('INV-2', $service);
        $this->assertEquals(404, $respNotFound->getStatusCode());
        $this->assertFalse($respNotFound->getData(true)['success']);
    }

    public function test_download_invoice_proxy_returns_pdf()
    {
        Http::fake([
            '*' => Http::response('PDF_BYTES', 200, ['Content-Type' => 'application/pdf'])
        ]);

        $request = Request::create('/', 'POST', ['file_url' => 'https://example.com/file.pdf']);

        $controller = new PennyLaneController(new LogService());

        $response = $controller->downloadInvoice($request);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
        $this->assertEquals('attachment; filename="facture.pdf"', $response->headers->get('Content-Disposition'));
        $this->assertEquals('PDF_BYTES', $response->getContent());
    }
}
