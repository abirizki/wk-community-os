<?php
class CreateDashboardCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Dashboard';
        return $this->output('Create dashboard request for ' . $name . '.');
    }
}
