<?php
class VersionCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output("Framework Version: 1.0.0\nBuild: dev\nEnvironment: development\nRepository: wk_prod");
    }
}
