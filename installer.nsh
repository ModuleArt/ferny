!macro customInstall
  WriteRegStr SHCTX "SOFTWARE\RegisteredApplications" "Ferny" "Software\Clients\StartMenuInternet\Ferny\Capabilities"

  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny" "" "Ferny web page document"
  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny\Application" "AppUserModelId" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny\Application" "ApplicationIcon" "$INSTDIR\Ferny.exe,0"
  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny\Application" "ApplicationName" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny\Application" "ApplicationCompany" "Ferny"      
  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny\Application" "ApplicationDescription" "Your favorite web browser"      
  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny\DefaultIcon" "DefaultIcon" "$INSTDIR\Ferny.exe,0"
  WriteRegStr SHCTX "SOFTWARE\Classes\Ferny\shell\open\command" "" '"$INSTDIR\Ferny.exe" "%1"'

  WriteRegStr SHCTX "SOFTWARE\Classes\.htm\OpenWithProgIds" "Ferny" ""
  WriteRegStr SHCTX "SOFTWARE\Classes\.html\OpenWithProgIds" "Ferny" ""

  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny" "" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\DefaultIcon" "" "$INSTDIR\Ferny.exe,0"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities" "ApplicationDescription" "Your favorite web browser"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities" "ApplicationName" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities" "ApplicationIcon" "$INSTDIR\Ferny.exe,0"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities\FileAssociations" ".htm" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities\FileAssociations" ".html" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities\URLAssociations" "http" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities\URLAssociations" "https" "Ferny"
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\Capabilities\StartMenu" "StartMenuInternet" "Ferny"
  
  WriteRegDWORD SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\InstallInfo" "IconsVisible" 1
  
  WriteRegStr SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny\shell\open\command" "" "$INSTDIR\Ferny.exe"
!macroend
!macro customUnInstall
  DeleteRegKey SHCTX "SOFTWARE\Classes\Ferny"
  DeleteRegKey SHCTX "SOFTWARE\Clients\StartMenuInternet\Ferny"
  DeleteRegValue SHCTX "SOFTWARE\RegisteredApplications" "Ferny"
!macroend