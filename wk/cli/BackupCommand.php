<?php
class BackupCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output('Backup command invoked.');
    }
}
