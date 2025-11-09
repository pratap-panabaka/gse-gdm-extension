# gdm-extension

> [!CAUTION]
> This extension is **experimental** and primarily tested on Arch Linux with GNOME Shell v47. It has been rarely tested on Ubuntu and Debian.  
>
> Although development has been ongoing since Dec 2023, in very rare cases, installing or using this extension could make it impossible to reach even TTY. In such a scenario, a **bootable USB** is required to remove the extension. Ensure you have a bootable USB and some experience mounting drives and removing files via the command line.  
>
> This extension installs at:
> ```
> /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm
> ```
>
> [!NOTE]
> This extension assumes that **no other GNOME Shell extensions are enabled for the GDM user**.  
> Users are responsible for managing the GDM database and configuring the GDM profile. Conflicts with other extensions or manual modifications may lead to **unexpected behavior**.

---

### Overview
A GNOME Shell extension to **customize the GDM Login Screen** for GNOME v42 and above.  

Features include:  
- Background colors, images, blur for up to 4 monitors.  
- Custom shell themes, accent colors, icon themes, fonts.  
- Customizable logo and banner messages.  
- All changes configurable **directly from the login screen**.

---

### Prerequisite Packages
Ensure the following are installed:  
1. `zip`  
2. `unzip`  
3. `dconf`  
4. `glib-compile-schemas`

---

### Installation
```bash
git clone https://github.com/pratap-panabaka/gse-gdm-extension/
cd gse-gdm-extension
sudo ./install.sh
```

### Uninstall
```bash
sudo ./install.sh
```
