package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan string, 3)

	for i := 0; i < 5; i++ {
		go func(i int) {
			time.Sleep(time.Second * 1)
			fmt.Println("goroutine: ", i+1)
			ch <- fmt.Sprint("goroutine: ", i+1)
		}(i)
	}

	<-ch

	fmt.Println("goroutines ended")
}
