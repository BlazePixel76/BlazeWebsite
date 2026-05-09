#include <stdint.h>
#include <stddef.h>

// Hardcore XOR vault engine (WASM export target)
// XORs each byte with the key.
//
// input_ptr: pointer to bytes
// input_len: number of bytes
// key: XOR key
// output_ptr: destination buffer (must be at least input_len bytes)
__attribute__((visibility("default")))
void xor_bytes(const uint8_t* input_ptr, size_t input_len, uint8_t key, uint8_t* output_ptr) {
    // Pointer arithmetic for high-performance memory access.
    const uint8_t* in  = input_ptr;
    uint8_t* out = output_ptr;

    // Byte-wise XOR loop.
    for (size_t i = 0; i < input_len; i++) {
        out[i] = (uint8_t)(in[i] ^ key);
    }
}

