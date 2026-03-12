<?
require_once "SyncContacts.php";
require_once "SyncProducts.php";
require_once "SyncOrders.php";

echo "Bling sync iniciado\n";

SyncContacts::run();
SyncProducts::run();
SyncOrders::run();

echo "Bling sync finalizado\n";
