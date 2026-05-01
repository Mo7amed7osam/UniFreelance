import time

class Timer:
    def __init__(self):
        self._start_time = time.time()
        self._running = True

    def elapsed(self) -> float:
        return time.time() - self._start_time

    def formatted(self) -> str:
      
        total   = int(self.elapsed())
        hours   = total // 3600
        minutes = (total % 3600) // 60
        seconds = total % 60
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    def reset(self):
        self._start_time = time.time()
        self._running = True
    
    def start(self):
        self._start_time = time.time()
        self._running = True
    
    def stop(self):
        self._running = False
    
    def is_running(self) -> bool:
        return self._running
    
    def get_elapsed(self) -> float:
        return self.elapsed()
