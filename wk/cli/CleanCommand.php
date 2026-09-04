<?php
class CleanCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output('Clean command invoked.');
    }
}
