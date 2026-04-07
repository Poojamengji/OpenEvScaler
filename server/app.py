import os
import subprocess
import sys

def main():
    print("Starting OpenEnv Multi-Mode wrapper...", flush=True)
    
    # Forward the environment and invoke the Node.js server
    env = os.environ.copy()
    process = subprocess.Popen(["npm", "start"], env=env)
    
    try:
        process.wait()
    except KeyboardInterrupt:
        process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
