ARG VARIANT=18
FROM mcr.microsoft.com/devcontainers/typescript-node:0-${VARIANT}

ARG DEBIAN_FRONTEND=noninteractive

RUN echo 'deb http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_11/ /' | sudo tee /etc/apt/sources.list.d/shells:fish:release:3.list && \
	curl -fsSL https://download.opensuse.org/repositories/shells:fish:release:3/Debian_11/Release.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/shells_fish_release_3.gpg > /dev/null && \
	sudo apt update -y && \
	sudo apt install fish -y

RUN chsh -s /usr/bin/fish
ENV SHELL /usr/bin/fish
ENV LANG=C.UTF-8 LANGUAGE=C.UTF-8 LC_ALL=C.UTF-8

RUN mkdir /home/node/.config && \
	mkdir /home/node/.config/fish && \
	chown -R node /home/node/.config

RUN curl -fsSL https://starship.rs/install.sh | sh -s -- -y
RUN	echo "starship init fish | source" >> /home/node/.config/fish/config.fish
RUN	starship preset plain-text-symbols -o /home/node/.config/starship.toml

RUN su node -c "npm i @sapphire/cli -g"
RUN su node -c "npm i -g turbo"
