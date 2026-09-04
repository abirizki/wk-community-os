<?php
class BuildCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output('Build command invoked.');
    }
}
