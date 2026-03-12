class BlingClient {

private $token;

public function __construct()
{
$config = require __DIR__.'/../../config/bling.php';
$this->token = $config['token'];
}

public function get($endpoint)
{

$url="https://api.bling.com.br/Api/v3".$endpoint;

$ch=curl_init($url);

curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);

curl_setopt($ch,CURLOPT_HTTPHEADER,[

"Authorization: Bearer ".$this->token

]);

$response=curl_exec($ch);

curl_close($ch);

return json_decode($response,true);

}

}
