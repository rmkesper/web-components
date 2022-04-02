# start project:
# https://www.mfitzp.com/tutorials/packaging-pyqt5-pyside2-applications-windows-pyinstaller/
# install pyinstaller
# set venv: python -m venv venv
# activate venv: venv\Scripts\activate
# install gui stuff
# -> python -m pip install PyQt5 PyInstaller
# -> python -m pip install PySide2 PyInstaller
# build project:
# pyinstaller <py>.spec --noconsole --onefile

from PyQt5 import QtCore, QtWidgets, QtWebEngineWidgets, QtWebChannel

class Backend(QtCore.QObject):
    @QtCore.pyqtSlot(str, result=str)
    def getD(self, v):
        print(v)
        return "given: " + v

if __name__ == "__main__":
    import os
    import sys

    app = QtWidgets.QApplication(sys.argv)

    backend = Backend()

    view = QtWebEngineWidgets.QWebEngineView()

    channel = QtWebChannel.QWebChannel()
    view.page().setWebChannel(channel)
    channel.registerObject("backend", backend)

    current_dir = os.path.dirname(os.path.realpath(__file__))
    filename = os.path.join(current_dir, "index.html")
    url = QtCore.QUrl.fromLocalFile(filename)
    view.load(url)

    #view.resize(640, 480)
    #view.show()
    view.showMaximized()
    sys.exit(app.exec_())
