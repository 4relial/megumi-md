{ pkgs }: {
    deps = [
        pkgs.nodejs-16_x
        pkgs.nodejs
        pkgs.nodePackages.typescript
        pkgs.ffmpeg
        pkgs.imagemagick
        pkgs.git
        pkgs.nodePackages.pm2
    ];
}
