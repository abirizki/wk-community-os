<?php
class CreatePermissionCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Permission';
        return $this->output('Create permission request for ' . $name . '.');
    }
}
