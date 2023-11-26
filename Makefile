DUMMY := $(shell git submodule update --init --recursive)

WASM_LD_PATH := $(shell which wasm-ld || find /usr/lib/llvm-* -name wasm-ld 2>/dev/null | head -n 1)

CC := clang
CFLAGS := -std=iso9899:1999 --target=wasm32 --no-standard-libraries -MMD -MP $(shell find . -type d -not -path '*/\.*' | sed 's/^/-I/')
LFLAGS := -std=iso9899:1999 --target=wasm32 --no-standard-libraries -fuse-ld=$(WASM_LD_PATH) -Wl,--export-all,--no-entry,--allow-undefined

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
