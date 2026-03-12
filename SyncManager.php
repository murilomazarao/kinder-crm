<?

class SyncManager {

public static function getLastSync($entity)
{

$db = Database::get();

$stmt = $db->prepare("SELECT last_sync FROM bling_sync_state WHERE entity=?");

$stmt->execute([$entity]);

$row = $stmt->fetch();

return $row ? $row['last_sync'] : null;

}

}
