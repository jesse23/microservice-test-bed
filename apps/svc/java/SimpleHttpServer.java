import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class SimpleHttpServer {
    public static void main(String[] args) throws IOException {
        // Create an HTTP server on port 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(9090), 0);

        // Create a context for the root path ("/") and set a handler
        server.createContext("/", new MyHandler());

        // Start the server
        server.start();
    }

    public static void testFunc() throws IOException {
        throw new IOException("Simulated exception");
    }

    static class MyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Simulate an exception (e.g., unhandled IOException) to mimic improper socket
            // closure
            try {
           StringBuilder responseBuilder = new StringBuilder();

            // Generate a large response
            for (int i = 0; i < 100; i++) {
                responseBuilder.append("This is line ").append(i).append(" of the large response.\n");
            }
            String response = responseBuilder.toString();
            byte[] responseBytes = response.getBytes();

            // Send headers
            exchange.sendResponseHeaders(200, responseBytes.length);
            OutputStream os = exchange.getResponseBody();

            // Write content in chunks
            int bufferSize = 64; // 8KB buffer
            for (int i = 0; i < responseBytes.length; i += bufferSize) {
                int chunkSize = Math.min(bufferSize, responseBytes.length - i);
                os.write(responseBytes, i, chunkSize);
                System.out.println("before wait");
                Thread.sleep(1000);
                testFunc();
                System.out.println("after wait");
            }

                os.close();
            } catch (InterruptedException e) {
                e.printStackTrace();
                // Restore interrupted state
                // Thread.currentThread().interrupt();
            } catch (IOException e) {
                e.printStackTrace();

            }
        }
    }
}