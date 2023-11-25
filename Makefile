DUMMY := $(shell git submodule update --init --recursive)

CC := clang
CFLAGS := --target=wasm32 --no-standard-libraries -MMD -MP $(shell find . -type d -not -path '*/\.*' | sed 's/^/-I/')
LFLAGS := --target=wasm32 --no-standard-libraries -fuse-ld=/usr/lib/llvm-10/bin/wasm-ld -Wl,--export-all,--no-entry,--allow-undefined

REPO_NAME := $(shell basename `git rev-parse --show-toplevel`)
SRC := $(shell find . -name "*.c")
OBJS := $(SRC:.c=.o)
DEPS := $(OBJS:.o=.d)
TARGET := executable.wasm

all: $(TARGET)
	@rm -f main.c main.o main.d

$(TARGET): main.o $(OBJS)
	$(CC) $(LFLAGS) -o $@ $^

main.o: main.c
	$(CC) $(CFLAGS) -c $< -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

main.c:
	echo "extern int main_$(REPO_NAME)(void);" >> main.c
	echo "int main(void) { return main_$(REPO_NAME)(); }" >> main.c

-include $(DEPS)

clean:
	rm -f $(OBJS) $(DEPS) $(TARGET) main.c main.o null.d
