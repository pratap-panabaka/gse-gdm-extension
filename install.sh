#! /bin/bash
set -e

NAME=gdm-extension
DOMAIN=pratap.fastmail.fm
UUID=$NAME@$DOMAIN
ZIP_NAME=$UUID.zip

# Findout gnome-shell version
SHELL_VERSION=$(gnome-shell --version | cut -d ' ' -f3 | cut -d '.' -f1)

if [[ $SHELL_VERSION -lt 42 ]]
then
    echo "This script is not for the gnome-shell versions below 42, Exiting with no changes."
    exit 1
fi

if [[ $(id -u) -ne 0 ]]
then
    echo "You must be root to perform this action".
    exit 1
fi

echo -e "\n\n\t~~~~~~~~~~~~~~~~ gdm-extension ~~~~~~~~~~~~~~~~\n"
echo -e "\trunning the script...\n"
echo -e "\t1. gnome-shell version $SHELL_VERSION detected"

# Findout if 'Debian-gdm' user exists, other wise use 'gdm'
if [[ -z $(getent passwd Debian-gdm) ]]
then
	GDM_USER=gdm
else
	GDM_USER=Debian-gdm
fi

if [[ $SHELL_VERSION -ge 42 && $SHELL_VERSION -le 44 ]]
then
    cd src/v-42-43-44
else
    cd src/v-45-46-47-48-49
fi

echo -e "\t2. Creating zip file from the directory ${PWD##*/}"

zip -qr $ZIP_NAME ./* && echo -e "\t3. Zip file created"

echo -e "\t4. Doing the main stuff\n"

rm -rf /usr/local/share/gnome-shell/extensions/$UUID
rm -rf /usr/local/share/glib-2.0/schemas/gschemas.compiled
mkdir -p /usr/local/share/gnome-shell/extensions
mkdir -p /usr/local/share/glib-2.0/schemas
gnome-extensions install -f $ZIP_NAME
mv -f $HOME/.local/share/gnome-shell/extensions/$UUID/ /usr/local/share/gnome-shell/extensions/
glib-compile-schemas /usr/local/share/gnome-shell/extensions/$UUID/schemas --targetdir /usr/local/share/glib-2.0/schemas
rm -rf $ZIP_NAME
xhost si:localuser:$GDM_USER > /dev/null
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/shell/enabled-extensions
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/shell/disabled-extensions
sudo -u $GDM_USER dbus-launch dconf write /org/gnome/shell/enabled-extensions "@as ['$UUID']"
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/peripherals/touchpad/tap-to-click
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/show-battery-percentage
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-show-date
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-show-seconds
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-show-weekday
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-format
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/disable-restart-buttons
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/disable-user-list
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/banner-message-enable
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/logo
xhost -si:localuser:$GDM_USER > /dev/null
echo -e "\tgdm-extension is installed. You can set below for GDM Login Screen from the login screen itself\n
\t1. icon-theme
\t2. shell-theme
\t3. fonts
\t4. background with color, gradient or image with blur for multi-monitors"
echo -e "\n\t~~~~~~~~~~~~~~~~~~ Thank You ~~~~~~~~~~~~~~~~~~\n"
exit 0
