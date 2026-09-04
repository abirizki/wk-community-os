<?php
class ReleaseCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output('Release command invoked.');
    }
}
