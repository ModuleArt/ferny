!macro customInstall
  WriteRegStr SHCTX "SOFTWARE\RegisteredApplications" "Ferny" "Software\Clients\StartMenuInternet\Ferny\Capabilities"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities\StartMenu" "StartMenuInternet" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny" "" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities" "ApplicationDescription" "A privacy-focused, chromium-based, functional and beautiful web browser"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities" "ApplicationName" "Ferny"
  WriteRegDWORD SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\InstallInfo" "IconsVisible" 1
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\shell\open\command" "" "$0\Ferny.exe"
  WriteRegStr HKCU "SOFTWARE\Classes\BraveBetaHTML\shell\open\command" "" '"$0\Ferny.exe" -- "%1"'
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\BraveBeta\Capabilities\URLAssociations" "http" "Ferny"
!macroend
!macro customUnInstall
  DeleteRegKey HKCU "SOFTWARE\Classes\Ferny"
  DeleteRegKey SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny"
  DeleteRegValue SHCTX "SOFTWARE\RegisteredApplications" "Ferny"
!macroend
