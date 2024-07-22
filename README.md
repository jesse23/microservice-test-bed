# microservice-test-bed
```sh
# install deps
npm i

# start svc and bff
npm start -w @mstb/svc
npm start -w @mstb/bff

# run test
npm start -w @mstb/cli

# run netstat to check the socket state
netstat -aon | find "9090"
```

## Mock transient TCP state
`FIN_WAIT_1` is a transient state at network/OS level. We'll need special utilities to mock it properly:
- iptable on Linux (not sure how to yet)
- [clumsy](https://jagt.github.io/clumsy/) on Windows

`FIN_WAIT_2` would need java backend or net.server in nodeJS with allowHalfOpen set to true (index_net.js).
- In windows `FIN_WAIT_2/CLOSE_WAIT` will be recycled by OS automatically after couple of minutes.

### Usage for clumsy
- Run step above to hit `/fin_wait_1` endpoint.
- After the 200 state prints, before the timeout is over, go to clumsy and start the blocking rule.
- Go to prompt and run `netstat -aon | find "9090"` to we should see the expect incorrect state.
  - Rule `tcp.Ack==1 and tcp.SrcPort=9090` will mock `FIN_WAIT_1/ESTABLISHED` state.
  - Rule `tcp.Fin==1 and tcp.DstPort==9090` will mock `FIN_WAIT_1/LAST_ACK` state.
    - It will be hard to get `FIN_WAIT_1/CLOSE_WAIT` state as `CLOSE_WAIT->LAST_ACK` is done automatically by OOTB lib or OS.
  - For what is allowed in the tcp filter, see [here](https://svn.nmap.org/nmap-exp/yang/WinDivert-1.0.5-MSVC/doc/WinDivert.html#divert_tcphdr).