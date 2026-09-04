<?php
class CreateServiceCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Service';
        return $this->output('Create service request for ' . $name . '.');
    }
}
