<?php
class CreatePackageCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Package';
        return $this->output('Create package request for ' . $name . '.');
    }
}
