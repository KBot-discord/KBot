FROM mcr.microsoft.com/devcontainers/typescript-node:0-18

ARG DEBIAN_FRONTEND=noninteractive

## Fish - https://github.com/fish-shell/fish-shell ##
RUN echo 'deb http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_11/ /' | tee /etc/apt/sources.list.d/shells:fish:release:3.list && \
	curl -fsSL https://download.opensuse.org/repositories/shells:fish:release:3/Debian_11/Release.key | gpg --dearmor | tee /etc/apt/trusted.gpg.d/shells_fish_release_3.gpg > /dev/null && \
	apt update -y && \
	apt install fish -y

ENV SHELL=/usr/bin/fish LANG=C.UTF-8 LANGUAGE=C.UTF-8 LC_ALL=C.UTF-8

## Starship - https://github.com/starship/starship ##
RUN mkdir /home/node/.config && \
	mkdir /home/node/.config/fish && \
	chown -R node /home/node/.config && \
	curl -fsSL https://starship.rs/install.sh | sh -s -- -y && \
	echo "starship init fish | source" >> /home/node/.config/fish/config.fish && \
	starship preset plain-text-symbols -o /home/node/.config/starship.toml

## Buf - https://github.com/bufbuild/buf ##
RUN curl -sSL \
    	"https://github.com/bufbuild/buf/releases/download/v1.17.0/buf-$(uname -s)-$(uname -m)" \
      	-o "/usr/local/bin/buf" && \
    chmod +x "/usr/local/bin/buf" && \
	chsh -s /usr/bin/fish

## Hadolint - https://github.com/hadolint/hadolint ##
RUN curl -sSL \
      	"https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-$(uname -s)-$(uname -m)" \
      	-o "/usr/local/bin/hadolint" && \
    chmod +x "/usr/local/bin/hadolint"

RUN su node -c "npm i @sapphire/cli -g" && \
	su node -c "npm i -g turbo"
