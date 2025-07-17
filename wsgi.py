import eventlet
eventlet.monkey_patch()
from app import app, socketio, background_fetch

socketio.start_background_task(background_fetch)

if __name__ == "__main__":
    socketio.run(app)
