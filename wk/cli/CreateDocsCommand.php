<?php
class CreateDocsCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Docs';
        return $this->output('Create documentation request for ' . $name . '.');
    }
}
