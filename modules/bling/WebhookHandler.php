<?php

require_once __DIR__ . '/BlingClient.php';

class WebhookHandler
{

    public static function handle()
    {

        $payload = file_get_contents("php://input");
        $data = json_decode($payload, true);

        if (!$data) {
            http_response_code(400);
            echo "Payload inválido";
            return;
        }

        $event = $data['event'] ?? null;

        switch ($event) {

            case 'pedido.venda.criado':
                self::syncOrder($data['data']['id']);
                break;

            case 'produto.atualizado':
                self::syncProduct($data['data']['id']);
                break;

            case 'contato.atualizado':
                self::syncContact($data['data']['id']);
                break;

        }

        echo "OK";
    }

    private static function syncOrder($id)
    {

        $client = new BlingClient();

        $order = $client->get("/pedidos/vendas/".$id);

        // salvar no banco
    }

    private static function syncProduct($id)
    {

        $client = new BlingClient();

        $product = $client->get("/produtos/".$id);

        // salvar no banco
    }

    private static function syncContact($id)
    {

        $client = new BlingClient();

        $contact = $client->get("/contatos/".$id);

        // salvar no banco
    }

}
