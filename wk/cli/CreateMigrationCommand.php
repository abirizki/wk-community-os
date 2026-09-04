<?php
class CreateMigrationCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Migration';
        return $this->output('Create migration request for ' . $name . '.');
    }
}
