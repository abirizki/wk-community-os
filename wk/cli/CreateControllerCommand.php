<?php
class CreateControllerCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Controller';
        return $this->output('Create controller request for ' . $name . '.');
    }
}
